#!/bin/bash

# ==============================
# CONFIG
# ==============================
PORTS=(8000 4000 4200)
LOCK_FILE="/tmp/agente_hitl.lock"

# ==============================
# CORES
# ==============================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Bootstrapping Agente HITL ===${NC}\n"

# ==============================
# 🔒 SINGLE INSTANCE LOCK
# ==============================
if [ -f "$LOCK_FILE" ]; then
    OLD_PID=$(cat $LOCK_FILE)

    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "${RED}Já existe uma instância rodando (PID: $OLD_PID). Abortando.${NC}"
        exit 1
    else
        echo "Lock antigo encontrado. Limpando..."
        rm -f $LOCK_FILE
    fi
fi

echo $$ > $LOCK_FILE

# ==============================
# 🧹 FUNÇÃO: LIMPAR PORTAS
# ==============================
free_ports() {
    echo -e "${GREEN}Liberando portas...${NC}"

    for PORT in "${PORTS[@]}"; do
        for i in {1..5}; do
            PID=$(lsof -ti :$PORT)

            if [ -z "$PID" ]; then
                echo "Porta $PORT livre ✅"
                break
            fi

            echo "Porta $PORT ocupada por PID $PID (tentativa $i)"

            kill $PID 2>/dev/null
            sleep 1
        done

        # fallback hard kill
        PID=$(lsof -ti :$PORT)
        if [ ! -z "$PID" ]; then
            echo "Forçando kill na porta $PORT 🔥"
            kill -9 $PID 2>/dev/null
        fi
    done
}

# ==============================
# 🧨 CLEANUP GLOBAL
# ==============================
cleanup() {
    echo -e "\n${RED}Encerrando tudo...${NC}"

    # Mata backend e filhos
    if [ ! -z "$BACKEND_PID" ]; then
        pkill -P $BACKEND_PID 2>/dev/null
        kill $BACKEND_PID 2>/dev/null
    fi

    # Mata frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        pkill -P $FRONTEND_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
    fi

    # Libera portas
    free_ports

    # Remove lock
    rm -f $LOCK_FILE

    echo -e "${GREEN}Cleanup concluído ✅${NC}"
    exit
}

trap cleanup EXIT SIGINT SIGTERM

# ==============================
# 🚫 LIMPEZA INICIAL
# ==============================
free_ports

# ==============================
# 🔐 ENV
# ==============================
if [ -f "backend/.env" ]; then
    export $(grep -v '^#' backend/.env | xargs)
fi

# ==============================
# 🧠 BACKEND
# ==============================
echo -e "${GREEN}Subindo Backend...${NC}"
cd backend

if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1

python main.py &
BACKEND_PID=$!

cd ..

# Healthcheck backend (retry loop para imports lentos como pandas/mlflow)
echo "Aguardando backend subir na porta 4000..."
MAX_RETRIES=30
COUNT=0
BACKEND_UP=false

while [ $COUNT -lt $MAX_RETRIES ]; do
    if lsof -i :4000 > /dev/null; then
        BACKEND_UP=true
        break
    fi
    sleep 1
    COUNT=$((COUNT + 1))
    echo -n "."
done
echo ""

if [ "$BACKEND_UP" = false ]; then
    echo -e "${RED}Backend falhou ao subir após ${MAX_RETRIES}s${NC}"
    exit 1
fi

echo -e "${GREEN}Backend OK (PID: $BACKEND_PID)${NC}"

# ==============================
# 💻 FRONTEND
# ==============================
echo -e "${GREEN}Subindo Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
fi

npm start -- --open &
FRONTEND_PID=$!

cd ..

# ==============================
# 🔎 MONITORAMENTO CONTÍNUO
# ==============================
echo -e "${BLUE}Sistema em execução 🚀${NC}"

while true; do
    sleep 5

    # Se backend morreu → encerra tudo
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${RED}Backend caiu. Encerrando stack.${NC}"
        cleanup
    fi

    # Se frontend morreu → encerra tudo
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${RED}Frontend caiu. Encerrando stack.${NC}"
        cleanup
    fi
done