#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   ⚔️  CRÓNICAS DEL AMULETO  ⚔️
#   Juego narrativo de exploración y combate — Versión Terminal
# ═══════════════════════════════════════════════════════════════
# Requiere: bash 4+, terminal con colores ANSI
# Uso: bash cronicas_del_amuleto.sh

# ─── COLORES ───────────────────────────────────────────────────
R='\033[0;31m';  LR='\033[0;91m'; G='\033[0;32m'; LG='\033[0;92m'
Y='\033[1;33m';  B='\033[0;34m';  LB='\033[0;94m'; C='\033[0;36m'
LC='\033[0;96m'; M='\033[0;35m';  LM='\033[0;95m'; W='\033[1;37m'
GR='\033[0;37m'; DK='\033[0;90m'; BD='\033[1m';    DM='\033[2m'
NC='\033[0m'

# ─── ESTADO DEL JUGADOR ────────────────────────────────────────
HP=100; MAXHP=100; ATK=15; DEF=0
WEAPON=""; ARMOR=""; ZONE="bosque_1"
DRAGON_DEAD=0; AMULETO_USED=0; GAME_OVER=0
declare -a INV=()
declare -a DISCOVERED=("bosque_1")
declare -a LOG=()
declare -A ENEMY_DEAD=()
SAVE_FILE="$HOME/.cronicas_save"

# ─── DATOS DE ZONAS ────────────────────────────────────────────
declare -A ZN ZD ZNN ZS ZE ZW ZIT ZEN ZX ZY

ZN[bosque_1]="Entrada del Bosque Oscuro"
ZD[bosque_1]="Árboles imponentes bloquean la luz del sol. El aire es denso y húmedo. Algo te observa desde las sombras."
ZNN[bosque_1]="bosque_2"; ZE[bosque_1]="cueva_1"
ZIT[bosque_1]="espada_madera"; ZEN[bosque_1]=""; ZX[bosque_1]=1; ZY[bosque_1]=4

ZN[bosque_2]="Sendero Sinuoso"
ZD[bosque_2]="Un camino estrecho rodeado de espinas. Escuchas ruidos extraños entre los arbustos oscurecidos."
ZS[bosque_2]="bosque_1"; ZNN[bosque_2]="bosque_3"
ZIT[bosque_2]="pocion"; ZEN[bosque_2]="lobo"; ZX[bosque_2]=1; ZY[bosque_2]=3

ZN[bosque_3]="Claro Maldito"
ZD[bosque_3]="Un claro sin vegetación. La tierra está quemada y el aire huele a azufre."
ZS[bosque_3]="bosque_2"; ZE[bosque_3]="ruinas_1"
ZIT[bosque_3]="espada_hierro"; ZEN[bosque_3]=""; ZX[bosque_3]=1; ZY[bosque_3]=2

ZN[cueva_1]="Boca de la Cueva"
ZD[cueva_1]="La entrada de una cueva oscura y húmeda. Gotea agua del techo. El eco amplifica cada sonido."
ZW[cueva_1]="bosque_1"; ZE[cueva_1]="cueva_2"
ZIT[cueva_1]="pocion"; ZEN[cueva_1]="araña"; ZX[cueva_1]=2; ZY[cueva_1]=4

ZN[cueva_2]="Cavernas Profundas"
ZD[cueva_2]="Una cámara enorme llena de estalactitas brillantes. Entre las rocas hay algo útil."
ZW[cueva_2]="cueva_1"; ZNN[cueva_2]="ruinas_1"
ZIT[cueva_2]="armadura_cuero"; ZEN[cueva_2]="troll"; ZX[cueva_2]=3; ZY[cueva_2]=4

ZN[ruinas_1]="Ruinas Antiguas"
ZD[ruinas_1]="Columnas de mármol derruidas rodean una plaza cubierta de musgo. Inscripciones ilegibles en las piedras."
ZW[ruinas_1]="bosque_3"; ZS[ruinas_1]="cueva_2"; ZE[ruinas_1]="ruinas_2"
ZIT[ruinas_1]="pocion_maxima"; ZEN[ruinas_1]="espectro"; ZX[ruinas_1]=2; ZY[ruinas_1]=2

ZN[ruinas_2]="Altar Corrompido"
ZD[ruinas_2]="Un altar de obsidiana emana una luz dorada pulsante. Sobre él descansa algo de enorme poder."
ZW[ruinas_2]="ruinas_1"; ZS[ruinas_2]="volcan_1"
ZIT[ruinas_2]="amuleto_luz"; ZEN[ruinas_2]=""; ZX[ruinas_2]=3; ZY[ruinas_2]=2

ZN[volcan_1]="Faldas del Volcán"
ZD[volcan_1]="El calor es sofocante. La roca volcánica cruje bajo tus pies. El volcán escupe lava a lo lejos."
ZNN[volcan_1]="ruinas_2"; ZE[volcan_1]="volcan_2"
ZIT[volcan_1]=""; ZEN[volcan_1]="golem"; ZX[volcan_1]=3; ZY[volcan_1]=3

ZN[volcan_2]="Cima del Volcán"
ZD[volcan_2]="Desde aquí ves el mundo corrompido extenderse. Entre las cenizas hay algo que brilla con fuerza."
ZW[volcan_2]="volcan_1"; ZNN[volcan_2]="guarida"
ZIT[volcan_2]="armadura_acero"; ZEN[volcan_2]=""; ZX[volcan_2]=4; ZY[volcan_2]=3

ZN[guarida]="Guarida del Dragón de Sombras"
ZD[guarida]="Una caverna de obsidiana negra. El suelo tiembla. Ante ti se alza el DRAGÓN DE SOMBRAS."
ZS[guarida]="volcan_2"
ZIT[guarida]=""; ZEN[guarida]="dragon"; ZX[guarida]=4; ZY[guarida]=2

# ─── DATOS DE ITEMS ────────────────────────────────────────────
declare -A IN IT IH IA ID
IN[espada_madera]="Espada de Madera";  IT[espada_madera]="weapon"; IA[espada_madera]=10
IN[espada_hierro]="Espada de Hierro";  IT[espada_hierro]="weapon"; IA[espada_hierro]=25
IN[armadura_cuero]="Armadura de Cuero";IT[armadura_cuero]="armor"; ID[armadura_cuero]=10
IN[armadura_acero]="Armadura de Acero";IT[armadura_acero]="armor"; ID[armadura_acero]=25
IN[pocion]="Poción";                   IT[pocion]="consumable";    IH[pocion]=50
IN[pocion_maxima]="Poción Máxima";     IT[pocion_maxima]="consumable"; IH[pocion_maxima]=100
IN[amuleto_luz]="Amuleto de Luz";      IT[amuleto_luz]="key"

# ─── DATOS DE ENEMIGOS ─────────────────────────────────────────
declare -A EN EHP EATK
EN[lobo]="Lobo Sombrío";        EHP[lobo]=40;  EATK[lobo]=12
EN[araña]="Araña Gigante";      EHP[araña]=35; EATK[araña]=10
EN[troll]="Troll de Caverna";   EHP[troll]=80; EATK[troll]=20
EN[espectro]="Espectro Corrupto"; EHP[espectro]=60; EATK[espectro]=18
EN[golem]="Gólem de Lava";      EHP[golem]=100; EATK[golem]=25
EN[dragon]="Dragón de Sombras"; EHP[dragon]=200; EATK[dragon]=30

# ─── UTILIDADES ────────────────────────────────────────────────
separador() { echo -e "${DK}$(printf '═%.0s' {1..60})${NC}"; }
linea()     { echo -e "${DK}$(printf '─%.0s' {1..60})${NC}"; }

msg() { # msg COLOR "texto"
  local color=$1; shift
  LOG+=("${color}$*${NC}")
  echo -e "  ${color}▸ $*${NC}"
}

msg_sistema() { echo -e "  ${DK}[SYS]${NC} ${GR}$*${NC}"; }

pausa() { echo -e "\n  ${DK}Pulsa ENTER para continuar...${NC}"; read -r; }

in_array() {
  local val="$1"; shift
  for e in "$@"; do [[ "$e" == "$val" ]] && return 0; done
  return 1
}

is_discovered() { in_array "$1" "${DISCOVERED[@]}"; }

discover_zone() {
  is_discovered "$1" || DISCOVERED+=("$1")
}

has_item() { in_array "$1" "${INV[@]}"; }

remove_item() {
  local target="$1"
  local new_inv=()
  local removed=0
  for item in "${INV[@]}"; do
    if [[ "$item" == "$target" && $removed -eq 0 ]]; then
      removed=1
    else
      new_inv+=("$item")
    fi
  done
  INV=("${new_inv[@]}")
}

# ─── ASCII ART ─────────────────────────────────────────────────
ascii_bosque() {
  echo -e "${G}"
  cat << 'ASCIIEOF'
          .     .  .      +     .      .          .
     .       .      .     #       .           .
        .      .         ###            .      .
      .      .   "#:. .:##"##:. .:#"  .      .
          .      . "####"###"####"  .
       .     "#:.    .:#"###"#:.    .:#"  .
              "########"#########"        .
        .    "#:.  "####"###"####"  .:#"
     .     .  "#######""##"##""#######"
                .""##"#####"#####"##"
    .   "#:. ...  .:##"###"###"##:.  ... .:#"
      .     "#######"##"#####"##"#######"
    .    .     "#####""#######""#####"
                      |||||
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ASCIIEOF
  echo -e "${NC}"
}

ascii_cueva() {
  echo -e "${GR}"
  cat << 'ASCIIEOF'
               . * .   . * .   . * .
              *       *       *
            .   * . *   . * .   * . *
           ___________________________________
          /  *    drip...        drip...    . \
         /      .       .    .       .        \
        |    *    (( ))          (( ))    *    |
        |       .  ~~~~  .  .  .~~~~  .       |
        |    * .          .          . *      |
        |         . * .        . * .          |
        |    *                          *     |
         \  .   ~~~~~~~~~~~~~~~~~~~~~~~~~~~  /
          \___________________________________/
                  ~echo... echo... echo~
ASCIIEOF
  echo -e "${NC}"
}

ascii_ruinas() {
  echo -e "${Y}"
  cat << 'ASCIIEOF'
      |       |       |       |       |
      |       |       |       |       |
    __|_    __|_    ___|_    __|_    __|_
   /    \  /    \  /     \  /    \  /    \
  | IIII || IIII ||  III  || IIII || IIII |
  |      ||      ||       ||      ||      |
  |______||______||_______||______||______|
  ..................................................
  .  . * . * .  .  . * .   . * .  . * .  . * .  .
  .    [ancient inscriptions fade into darkness]  .
  ..................................................
ASCIIEOF
  echo -e "${NC}"
}

ascii_altar() {
  echo -e "${M}"
  cat << 'ASCIIEOF'
                    *  *  *
                  *   ***   *
                 *  *  *  *  *
                *      *      *
               * *    ***    * *
              *    *   *   *    *
             *  *    *   *    *  *
            *    *  *   *  *    *
           ________________________
          |  ____________________  |
          | |                    | |
          | |   ✦  AMULETO  ✦   | |
          | |    *  DE LUZ  *    | |
          | |   ~~~~~~~~~~~~~~~~ | |
          | |____________________| |
          |________________________|
                   |||||
              _____|||||_____
ASCIIEOF
  echo -e "${NC}"
}

ascii_volcan() {
  echo -e "${R}"
  cat << 'ASCIIEOF'
                   /\
                  /  \      * sparks *
                 / /\ \
                / /~~\ \
               / /    \ \
              / /  /\  \ \
             / /  /  \  \ \
            / /  / /\ \  \ \
           /___/___/  \___\___\
          |  ~ ~ LAVA ~ ~ ~ ~  |
         /~~~~~~~~~~~~~~~~~~~~~~\
        / ~  ~  ~  ~  ~  ~  ~  ~ \
       |  * ember * ember * ember  |
       |____________________________|
ASCIIEOF
  echo -e "${NC}"
}

ascii_guarida() {
  echo -e "${LR}"
  cat << 'ASCIIEOF'
              /\       /\
             /  \  /\ /  \
            / /\ \/  \/ /\ \
           / /  \      /  \ \
          / /    \ DRAGON  \ \
         / /      \SHADOWS / \ \
        / /    /\  \    /  /\ \ \
       /___\  /  \  \  /  /  \/___\
      |     \/    \  \/  /    /    |
      | * * *\     \    /     / * *|
      |* * * *\     \  /     /* * *|
      |* *  * *\___  \/  ___/* *  *|
      |_______________________________|
             !!! DANGER !!!
ASCIIEOF
  echo -e "${NC}"
}

show_ascii() {
  case $1 in
    bosque_1|bosque_2|bosque_3) ascii_bosque ;;
    cueva_1|cueva_2)            ascii_cueva  ;;
    ruinas_1)                   ascii_ruinas ;;
    ruinas_2)                   ascii_altar  ;;
    volcan_1|volcan_2)          ascii_volcan ;;
    guarida)                    ascii_guarida;;
  esac
}

# ─── MINIMAPA ──────────────────────────────────────────────────
show_minimap() {
  # Mapa 5x5 (col=X, row=Y invertido)
  # Zonas con posiciones X:1-4, Y:2-4
  # X: 1=bosques, 2=ruinas_1/cueva_1, 3=ruinas_2/cueva_2/volcan_1, 4=volcan_2/guarida
  # Y: 2=top, 3=mid, 4=bottom
  declare -A grid
  local all_zones=("bosque_1" "bosque_2" "bosque_3" "cueva_1" "cueva_2" "ruinas_1" "ruinas_2" "volcan_1" "volcan_2" "guarida")
  for z in "${all_zones[@]}"; do
    if is_discovered "$z"; then
      local key="${ZX[$z]},${ZY[$z]}"
      if [[ "$z" == "guarida" ]]; then
        grid[$key]="[X]"
      elif [[ "$z" == "$ZONE" ]]; then
        grid[$key]="[@]"
      else
        grid[$key]="[·]"
      fi
    fi
  done

  echo -e "  ${DK}╔════════════════╗${NC}"
  echo -e "  ${DK}║${NC} ${BD}MINIMAPA${NC}        ${DK}║${NC}"
  echo -e "  ${DK}╠════════════════╣${NC}"
  for y in 1 2 3 4; do
    printf "  ${DK}║${NC} "
    for x in 1 2 3 4; do
      local key="$x,$y"
      if [[ -n "${grid[$key]}" ]]; then
        if [[ "${grid[$key]}" == "[@]" ]]; then
          printf "${LC}[@]${NC}"
        elif [[ "${grid[$key]}" == "[X]" ]]; then
          printf "${LR}[X]${NC}"
        else
          printf "${GR}[·]${NC}"
        fi
      else
        printf "   "
      fi
    done
    printf " ${DK}║${NC}\n"
  done
  echo -e "  ${DK}╚════════════════╝${NC}"
  echo -e "  ${DK}[@]${NC}=tú  ${DK}[X]${NC}=dragón  ${DK}[·]${NC}=explorado"
}

# ─── HUD ───────────────────────────────────────────────────────
show_hud() {
  separador
  # Barra de vida
  local bar_len=30
  local filled=$(( HP * bar_len / MAXHP ))
  [[ $filled -lt 0 ]] && filled=0
  local empty=$(( bar_len - filled ))
  local bar_color=$LG
  [[ $HP -le 50 ]] && bar_color=$Y
  [[ $HP -le 25 ]] && bar_color=$LR

  printf "  ${W}INTEGRIDAD${NC}  ${bar_color}"
  printf '█%.0s' $(seq 1 $filled)
  printf "${DK}"
  printf '░%.0s' $(seq 1 $empty)
  printf "${NC}  ${BD}${bar_color}%d/%d${NC}\n" "$HP" "$MAXHP"

  # Zona
  echo -e "  ${C}ZONA:${NC} ${W}${ZN[$ZONE]}${NC}"

  # Salidas
  local exits=""
  [[ -n "${ZNN[$ZONE]}" ]] && exits+="norte "
  [[ -n "${ZS[$ZONE]}"  ]] && exits+="sur "
  [[ -n "${ZE[$ZONE]}"  ]] && exits+="este "
  [[ -n "${ZW[$ZONE]}"  ]] && exits+="oeste "
  echo -e "  ${C}SALIDAS:${NC} ${GR}${exits:-ninguna}${NC}"

  # Equipo
  local w_name="${IN[$WEAPON]:-Ninguna}"
  local a_name="${IN[$ARMOR]:-Ninguna}"
  echo -e "  ${C}ARMA:${NC} ${Y}${w_name}${NC}  ${C}ARMADURA:${NC} ${Y}${a_name}${NC}"

  # Inventario
  if [[ ${#INV[@]} -eq 0 ]]; then
    echo -e "  ${C}BOLSA:${NC} ${DK}vacía${NC}"
  else
    local inv_str=""
    for item in "${INV[@]}"; do
      inv_str+="${IN[$item]}, "
    done
    echo -e "  ${C}BOLSA:${NC} ${GR}${inv_str%, }${NC}"
  fi
  separador
}

# ─── INTRO ─────────────────────────────────────────────────────
show_intro() {
  clear
  echo -e "${M}"
  cat << 'INTRO'
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║          ⚔   C R Ó N I C A S   D E L   A M U L E T O   ⚔   ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
INTRO
  echo -e "${NC}"

  echo -e "${DM}${GR}"
  sleep 0.5
  echo -e "  Hace un tiempo que nadie recuerda, el mundo vivía en equilibrio."
  sleep 1
  echo -e "  La luz y la oscuridad coexistían, guardadas por el Amuleto de Luz."
  sleep 1
  echo ""
  echo -e "  Entonces llegó el Dragón de Sombras."
  sleep 1
  echo ""
  echo -e "  Corrompió la tierra. Extinguió el sol. Devoró el silencio."
  sleep 1
  echo ""
  echo -e "  El Amuleto fue escondido en lo más profundo del mundo corrompido."
  sleep 1
  echo -e "  Y todos olvidaron... excepto tú."
  sleep 1
  echo ""
  echo -e "${W}  Tú eres el último viajero.${NC}${DM}${GR}"
  sleep 1
  echo -e "  Explora. Encuentra el amuleto. Derrota al dragón."
  sleep 1
  echo -e "${Y}  Restaura el mundo.${NC}"
  sleep 1
  echo ""
  echo -e "${DK}  ════════════════════════════════════════════════════${NC}"
  echo -e "${GR}  Comandos: ir [norte/sur/este/oeste] · explorar · mirar"
  echo -e "           coger [objeto] · equipar [objeto] · usar [objeto]"
  echo -e "           atacar · inventario · guardar · cargar · ayuda${NC}"
  echo -e "${DK}  ════════════════════════════════════════════════════${NC}"
  echo ""
  pausa
}

# ─── MOSTRAR ESCENA ────────────────────────────────────────────
show_scene() {
  clear
  show_ascii "$ZONE"
  show_hud

  # Descripción
  echo ""
  echo -e "  ${W}${ZD[$ZONE]}${NC}"
  echo ""

  # Objeto en zona
  local zone_item="${ZIT[$ZONE]}"
  if [[ -n "$zone_item" ]] && ! has_item "$zone_item"; then
    echo -e "  ${Y}✦ Ves aquí: ${IN[$zone_item]}${NC}"
  fi

  # Enemigo
  local zone_enemy="${ZEN[$ZONE]}"
  if [[ -n "$zone_enemy" ]] && [[ -z "${ENEMY_DEAD[$ZONE]}" ]]; then
    echo -e "  ${LR}⚠ Hay un enemigo: ${EN[$zone_enemy]}${NC}"
  fi

  echo ""
}

# ─── COMBATE ───────────────────────────────────────────────────
combat() {
  local enemy_key="${ZEN[$ZONE]}"
  [[ -z "$enemy_key" ]] && { msg $LR "No hay ningún enemigo aquí."; return; }
  [[ -n "${ENEMY_DEAD[$ZONE]}" ]] && { msg $LR "Ya derrotaste al enemigo de esta zona."; return; }

  local ename="${EN[$enemy_key]}"
  local ehp="${EHP[$enemy_key]}"
  local eatk="${EATK[$enemy_key]}"

  echo ""
  separador
  echo -e "  ${LR}${BD}⚔  COMBATE: ${ename}${NC}"
  separador
  echo -e "  ${GR}HP Enemigo: ${LR}${ehp}${NC}"
  echo ""

  # Daño del jugador
  local player_dmg=$(( ATK + RANDOM % 10 ))
  echo -e "  ${LG}⚔ Atacas a ${ename} y causas ${BD}${player_dmg}${NC}${LG} de daño.${NC}"
  ehp=$(( ehp - player_dmg ))

  if [[ $ehp -le 0 ]]; then
    echo ""
    if [[ "$enemy_key" == "dragon" ]]; then
      echo -e "  ${Y}${BD}¡¡DRAGÓN DERROTADO!!${NC}"
      echo -e "  ${M}El Dragón de Sombras cae. Un silencio extraño envuelve el mundo...${NC}"
      echo -e "  ${GR}El dragón ha sido vencido. Ahora usa el Amuleto de Luz.${NC}"
      DRAGON_DEAD=1
    else
      echo -e "  ${LG}${BD}¡${ename} ha sido derrotado!${NC}"
    fi
    ENEMY_DEAD[$ZONE]=1
    separador
    return
  fi

  # Contraataque enemigo
  local enemy_roll=$RANDOM
  local enemy_dmg
  if [[ "$enemy_key" == "dragon" ]]; then
    enemy_dmg=$(( 10 + RANDOM % 21 ))
  else
    enemy_dmg=$(( eatk + RANDOM % 8 - 2 ))
    [[ $enemy_dmg -lt 1 ]] && enemy_dmg=1
  fi

  local absorbed=$(( enemy_dmg * DEF / 100 ))
  local real_dmg=$(( enemy_dmg - absorbed ))
  [[ $real_dmg -lt 1 ]] && real_dmg=1

  echo -e "  ${LR}💀 ${ename} contraataca y te causa ${BD}${real_dmg}${NC}${LR} de daño.${NC}"
  [[ $absorbed -gt 0 ]] && echo -e "  ${GR}  (tu armadura absorbe ${absorbed} de daño)${NC}"
  HP=$(( HP - real_dmg ))

  if [[ $HP -le 0 ]]; then
    HP=0
    echo ""
    echo -e "  ${LR}${BD}☠  HAS MUERTO  ☠${NC}"
    echo -e "  ${GR}La oscuridad te consume...${NC}"
    GAME_OVER=1
  else
    echo -e "  ${GR}Tu HP: ${HP}/${MAXHP}${NC}"
    echo -e "  ${DK}HP de ${ename}: ${ehp}${NC}  ${GR}[escribe 'atacar' de nuevo]${NC}"
    # Actualizar HP del enemigo para próximo turno
    EHP[$enemy_key]=$ehp
  fi
  separador
}

# ─── COMANDOS ──────────────────────────────────────────────────
cmd_ir() {
  local dir="$1"
  local dest=""
  case "$dir" in
    norte|n)   dest="${ZNN[$ZONE]}" ;;
    sur|s)     dest="${ZS[$ZONE]}"  ;;
    este|e)    dest="${ZE[$ZONE]}"  ;;
    oeste|o|w) dest="${ZW[$ZONE]}"  ;;
    *) msg $LR "Dirección desconocida. Usa: norte, sur, este, oeste."; return ;;
  esac

  if [[ -z "$dest" ]]; then
    msg $LR "No puedes ir al $dir desde aquí."
    return
  fi

  # Comprobar enemigo vivo
  local enemy="${ZEN[$ZONE]}"
  if [[ -n "$enemy" ]] && [[ -z "${ENEMY_DEAD[$ZONE]}" ]]; then
    msg $LR "¡El ${EN[$enemy]} te bloquea el paso! Debes derrotarlo primero."
    return
  fi

  ZONE="$dest"
  discover_zone "$ZONE"
  msg $LG "Te desplazas hacia el $dir..."
  show_scene
}

cmd_mirar() {
  echo ""
  echo -e "  ${W}${ZN[$ZONE]}${NC}"
  echo -e "  ${GR}${ZD[$ZONE]}${NC}"
  echo ""
  local zone_item="${ZIT[$ZONE]}"
  if [[ -n "$zone_item" ]] && ! has_item "$zone_item"; then
    echo -e "  ${Y}Ves aquí: ${BD}${IN[$zone_item]}${NC}"
  fi
  local zone_enemy="${ZEN[$ZONE]}"
  if [[ -n "$zone_enemy" ]] && [[ -z "${ENEMY_DEAD[$ZONE]}" ]]; then
    echo -e "  ${LR}⚠ Amenaza presente: ${EN[$zone_enemy]}${NC}"
  fi
}

cmd_explorar() {
  local zone_item="${ZIT[$ZONE]}"
  if [[ -z "$zone_item" ]]; then
    msg $GR "Exploras el área pero no encuentras nada útil."
    return
  fi
  if has_item "$zone_item"; then
    msg $GR "Ya recogiste el ${IN[$zone_item]} de aquí."
    return
  fi
  msg $Y "Encuentras algo al explorar: ${BD}${IN[$zone_item]}${NC}${Y}. Usa 'coger ${zone_item}' para recogerlo."
}

cmd_coger() {
  local item_key="$1"
  local zone_item="${ZIT[$ZONE]}"

  if [[ -z "$item_key" ]]; then
    msg $LR "¿Qué quieres coger? Escribe 'coger [objeto]'."; return
  fi

  # Aceptar nombre parcial
  local found_key=""
  for k in "${!IN[@]}"; do
    if [[ "$k" == *"$item_key"* ]] || [[ "${IN[$k],,}" == *"$item_key"* ]]; then
      found_key="$k"; break
    fi
  done

  [[ -z "$found_key" ]] && found_key="$item_key"

  if [[ "$found_key" != "$zone_item" ]]; then
    msg $LR "No hay '${IN[$found_key]:-$item_key}' aquí para coger."
    return
  fi

  if has_item "$found_key"; then
    msg $LR "Ya tienes ${IN[$found_key]}."; return
  fi

  INV+=("$found_key")
  msg $LG "Coges: ${BD}${IN[$found_key]}${NC}${LG}."
}

cmd_equipar() {
  local item_key="$1"
  [[ -z "$item_key" ]] && { msg $LR "¿Qué quieres equipar?"; return; }

  # Buscar por nombre parcial en inventario
  local found_key=""
  for k in "${INV[@]}"; do
    if [[ "$k" == *"$item_key"* ]] || [[ "${IN[$k],,}" == *"$item_key"* ]]; then
      found_key="$k"; break
    fi
  done

  if [[ -z "$found_key" ]]; then
    msg $LR "No tienes ese objeto en el inventario."; return
  fi

  local itype="${IT[$found_key]}"
  if [[ "$itype" == "weapon" ]]; then
    WEAPON="$found_key"
    ATK=$(( 15 + ${IA[$found_key]:-0} ))
    msg $LG "Equipas: ${BD}${IN[$found_key]}${NC}${LG}. ATK → ${ATK}"
  elif [[ "$itype" == "armor" ]]; then
    ARMOR="$found_key"
    DEF=$(( ${ID[$found_key]:-0} ))
    msg $LG "Equipas: ${BD}${IN[$found_key]}${NC}${LG}. DEF → ${DEF}%"
  else
    msg $LR "Ese objeto no se puede equipar."
  fi
}

cmd_usar() {
  local item_key="$1"
  [[ -z "$item_key" ]] && { msg $LR "¿Qué quieres usar?"; return; }

  # Buscar por nombre parcial en inventario
  local found_key=""
  for k in "${INV[@]}"; do
    if [[ "$k" == *"$item_key"* ]] || [[ "${IN[$k],,}" == *"$item_key"* ]]; then
      found_key="$k"; break
    fi
  done

  if [[ -z "$found_key" ]]; then
    msg $LR "No tienes ese objeto."; return
  fi

  local itype="${IT[$found_key]}"

  if [[ "$itype" == "consumable" ]]; then
    local heal="${IH[$found_key]:-0}"
    HP=$(( HP + heal ))
    [[ $HP -gt $MAXHP ]] && HP=$MAXHP
    remove_item "$found_key"
    msg $LG "Usas ${IN[$found_key]}. Recuperas ${heal} HP. HP: ${HP}/${MAXHP}"

  elif [[ "$found_key" == "amuleto_luz" ]]; then
    if [[ $DRAGON_DEAD -eq 0 ]]; then
      msg $LR "Sientes el poder del Amuleto, pero aún no es el momento."
      msg $LR "Primero debes derrotar al Dragón de Sombras."
      return
    fi
    # Evento final
    cmd_final
  else
    msg $LR "No sabes cómo usar ${IN[$found_key]}."
  fi
}

cmd_inventario() {
  echo ""
  echo -e "  ${W}${BD}═══ INVENTARIO ═══${NC}"
  if [[ ${#INV[@]} -eq 0 ]]; then
    echo -e "  ${DK}(vacío)${NC}"
  else
    for item in "${INV[@]}"; do
      local itype="${IT[$item]}"
      local extra=""
      [[ "$itype" == "consumable" ]] && extra=" (cura ${IH[$item]} HP)"
      [[ "$itype" == "weapon" ]]     && extra=" (ATK +${IA[$item]})"
      [[ "$itype" == "armor" ]]      && extra=" (DEF ${ID[$item]}%)"
      echo -e "  ${Y}· ${IN[$item]}${GR}${extra}${NC}"
    done
  fi
  echo ""
  echo -e "  ${W}${BD}═══ EQUIPO ═══${NC}"
  echo -e "  ${C}Arma:${NC}     ${Y}${IN[$WEAPON]:-Ninguna}${NC}"
  echo -e "  ${C}Armadura:${NC} ${Y}${IN[$ARMOR]:-Ninguna}${NC}"
  echo -e "  ${C}ATK:${NC} ${W}${ATK}${NC}  ${C}DEF:${NC} ${W}${DEF}%${NC}"
  echo ""
}

cmd_mapa() {
  echo ""
  show_minimap
  echo ""
}

cmd_ayuda() {
  echo ""
  separador
  echo -e "  ${W}${BD}COMANDOS DISPONIBLES${NC}"
  separador
  echo -e "  ${C}ir [norte|sur|este|oeste]${NC}  — Moverse"
  echo -e "  ${C}explorar${NC}                   — Buscar objetos"
  echo -e "  ${C}mirar${NC}                      — Ver descripción"
  echo -e "  ${C}coger [objeto]${NC}             — Recoger objeto"
  echo -e "  ${C}equipar [objeto]${NC}           — Equipar arma/armadura"
  echo -e "  ${C}usar [objeto]${NC}              — Usar consumible o artefacto"
  echo -e "  ${C}atacar${NC}                     — Atacar al enemigo"
  echo -e "  ${C}inventario${NC}                 — Ver bolsa y equipo"
  echo -e "  ${C}mapa${NC}                       — Ver minimapa"
  echo -e "  ${C}guardar${NC}                    — Guardar partida"
  echo -e "  ${C}cargar${NC}                     — Cargar partida guardada"
  echo -e "  ${C}salir${NC}                      — Salir del juego"
  separador
  echo ""
}

# ─── GUARDAR / CARGAR ──────────────────────────────────────────
cmd_guardar() {
  local inv_str="${INV[*]}"
  local disc_str="${DISCOVERED[*]}"
  local dead_str=""
  for k in "${!ENEMY_DEAD[@]}"; do
    dead_str+="${k}:${ENEMY_DEAD[$k]} "
  done

  cat > "$SAVE_FILE" << SAVEDATA
HP=$HP
MAXHP=$MAXHP
ATK=$ATK
DEF=$DEF
WEAPON=$WEAPON
ARMOR=$ARMOR
ZONE=$ZONE
DRAGON_DEAD=$DRAGON_DEAD
AMULETO_USED=$AMULETO_USED
INV_DATA="$inv_str"
DISC_DATA="$disc_str"
DEAD_DATA="$dead_str"
SAVEDATA

  msg $LG "Partida guardada en ${SAVE_FILE}."
}

cmd_cargar() {
  if [[ ! -f "$SAVE_FILE" ]]; then
    msg $LR "No hay ninguna partida guardada."; return
  fi

  source "$SAVE_FILE"

  # Restaurar arrays
  IFS=' ' read -r -a INV <<< "$INV_DATA"
  IFS=' ' read -r -a DISCOVERED <<< "$DISC_DATA"
  declare -A ENEMY_DEAD=()
  for pair in $DEAD_DATA; do
    local k="${pair%%:*}"; local v="${pair##*:}"
    ENEMY_DEAD[$k]="$v"
  done

  msg $LG "Partida cargada. Estás en: ${ZN[$ZONE]}."
  show_scene
}

# ─── EVENTO FINAL ──────────────────────────────────────────────
cmd_final() {
  clear
  echo -e "${M}"
  cat << 'FINALEOF'
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║              ✦  EL AMULETO DE LUZ DESPIERTA  ✦              ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
FINALEOF
  echo -e "${NC}"

  sleep 1
  echo -e "  ${W}Alzas el Amuleto de Luz sobre la oscuridad..."
  sleep 1
  echo -e "  ${Y}Una luz cegadora emerge del amuleto.${NC}"
  sleep 1
  echo -e "  ${LC}La corrupción que cubría el mundo comienza a retroceder.${NC}"
  sleep 1
  echo ""
  echo -e "  ${LG}Los árboles recobran el color.${NC}"
  sleep 0.8
  echo -e "  ${LG}Las ruinas comienzan a reconstruirse solas.${NC}"
  sleep 0.8
  echo -e "  ${LG}El volcán se apaga. La luz del sol vuelve al mundo.${NC}"
  sleep 1
  echo ""
  echo -e "  ${Y}${BD}El Dragón de Sombras ha sido derrotado para siempre.${NC}"
  sleep 1
  echo -e "  ${W}${BD}La luz ha sido restaurada.${NC}"
  sleep 1
  echo ""
  separador
  echo -e "  ${M}${BD}  ✦  FIN  ✦  CRÓNICAS DEL AMULETO  ✦  FIN  ✦${NC}"
  separador
  echo ""
  echo -e "  ${GR}Gracias por jugar.  — Cristian Bellmunt Redón${NC}"
  echo ""
  GAME_OVER=2
}

# ─── RESPUESTAS DESCONOCIDAS ───────────────────────────────────
unknown_cmd() {
  local responses=(
    "El viento no entiende tus palabras."
    "Las sombras no responden a eso."
    "Algo cruje en la oscuridad. Sin resultado."
    "El eco de tu voz se pierde en la nada."
    "Los árboles te observan sin comprender."
  )
  local r=$(( RANDOM % ${#responses[@]} ))
  msg $DK "${responses[$r]}"
}

# ─── PARSER DE COMANDOS ────────────────────────────────────────
parse_cmd() {
  local input="${1,,}"  # minúsculas
  input="${input#"${input%%[![:space:]]*}"}"  # trim

  local verb="${input%% *}"
  local rest="${input#* }"
  [[ "$rest" == "$verb" ]] && rest=""

  case "$verb" in
    ir|move|go)          cmd_ir "$rest" ;;
    norte|n|sur|s|este|e|oeste|o|w) cmd_ir "$verb" ;;
    explorar|explore)    cmd_explorar ;;
    mirar|look|ver)      cmd_mirar ;;
    coger|cojer|tomar|pick|get) cmd_coger "$rest" ;;
    equipar|equip)       cmd_equipar "$rest" ;;
    usar|use)            cmd_usar "$rest" ;;
    atacar|attack|atk|a) combat ;;
    inventario|inv|i)    cmd_inventario ;;
    mapa|map|minimapa)   cmd_mapa ;;
    guardar|save)        cmd_guardar ;;
    cargar|load)         cmd_cargar ;;
    ayuda|help|h|\?)     cmd_ayuda ;;
    salir|exit|quit|q)   echo -e "\n  ${GR}Hasta la próxima, viajero...${NC}\n"; exit 0 ;;
    "")                  : ;;
    *)                   unknown_cmd ;;
  esac
}

# ─── BUCLE PRINCIPAL ───────────────────────────────────────────
main() {
  show_intro
  show_scene

  while [[ $GAME_OVER -eq 0 ]]; do
    echo -ne "  ${LC}❯${NC} "
    read -r input
    echo ""
    parse_cmd "$input"
    echo ""

    if [[ $GAME_OVER -eq 1 ]]; then
      echo ""
      msg $LR "Has muerto. Tu historia termina aquí."
      echo -e "  ${GR}Escribe 'cargar' para cargar una partida guardada, o 'salir' para salir.${NC}"
      echo ""
      GAME_OVER=0  # Permitir cargar
    elif [[ $GAME_OVER -eq 2 ]]; then
      break
    fi
  done
}

# ─── INICIO ────────────────────────────────────────────────────
main
