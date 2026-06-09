/**
 * ScreenDatabase - Pantalla de la Base de Datos / Manual de Operaciones.
 */
window.RC = window.RC || {};
window.RC.ScreenDatabase = function ScreenDatabase() {
    return (
        <section id="screen-database" className="h-full flex flex-col p-6 gap-6 hidden animate__animated animate__fadeIn">
            <header className="flex justify-between items-center border-b-2 border-blue-500 pb-4">
                <div className="flex items-center gap-4">
                    <i className="fa-solid fa-database text-4xl text-blue-400"></i>
                    <div>
                        <h2 className="text-3xl font-bold tracking-widest text-blue-400 uppercase">Base de Datos de Operaciones</h2>
                        <p className="text-xs text-blue-900 font-mono">SISTEMA DE CONSULTA TÉCNICA RUTA-01 // ACCESO NIVEL 3</p>
                    </div>
                </div>
            </header>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {/* Menú de Navegación Lateral de la DB */}
                <div className="md:col-span-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                    <button className="db-nav-btn active" data-target="db-hud">
                        <i className="fa-solid fa-display mr-2"></i> MONITOR DE ESTADO
                    </button>
                    <button className="db-nav-btn" data-target="db-tools">
                        <i className="fa-solid fa-screwdriver-wrench mr-2"></i> HERRAMIENTAS
                    </button>
                    <button className="db-nav-btn" data-target="db-protocols">
                        <i className="fa-solid fa-file-shield mr-2"></i> PROTOCOLOS
                    </button>
                    <button className="db-nav-btn" data-target="db-traits">
                        <i className="fa-solid fa-users-gear mr-2"></i> RASGOS
                    </button>
                    <button className="db-nav-btn" data-target="db-threats">
                        <i className="fa-solid fa-biohazard mr-2"></i> LA AMENAZA
                    </button>
                    <button className="db-nav-btn text-cyan-400" data-target="db-analysis">
                        <i className="fa-solid fa-notes-medical mr-2"></i> ANÁLISIS PSICOLÓGICO
                    </button>
                </div>

                {/* Contenido Detallado */}
                <div id="db-content-area" className="md:col-span-2 bg-blue-950/10 border border-blue-900/30 p-6 overflow-y-auto custom-scrollbar font-mono">
                    {/* HUD Section */}
                    <div id="db-hud" className="db-section space-y-6">
                        <h3 className="text-2xl text-blue-400 border-b border-blue-900 pb-2 font-bold uppercase tracking-tighter">
                            Sistemas de Monitorización (HUD)
                        </h3>
                        <div className="space-y-6 text-lg">
                            <div className="p-4 border-l-4 border-chlorine bg-chlorine/5">
                                <h4 className="text-chlorine font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-brain"></i> PARANOIA (Presión del Sistema)
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Mide el nivel de sospecha acumulada en el sector. La paranoia aumenta al purgar civiles o ignorar sujetos sospechosos. <span className="text-orange-400">Un nivel alto (&gt;60%) provoca fallos de hardware (Glitches) en las herramientas y aumenta el consumo energético por alerta de seguridad.</span>
                                </p>
                                <p className="text-xs text-blue-500 mt-2 font-bold">NOTA: Al 100%, el comando central te considerará una amenaza y procederá a tu eliminación.</p>
                            </div>
                            <div className="p-4 border-l-4 border-rose-500 bg-rose-500/5">
                                <h4 class="text-rose-500 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-heart-pulse"></i> SALUD MENTAL (Estabilidad Psíquica)
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Representa tu capacidad para discernir la realidad. <span className="text-rose-400">Si cae por debajo del 40%, experimentarás alucinaciones: las herramientas pueden mostrar síntomas falsos o ignorar los reales, y el HUD puede mentir sobre tus recursos.</span> Se recupera eliminando amenazas reales.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-amber-500 bg-amber-500/5">
                                <h4 className="text-amber-500 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-box"></i> SUMINISTROS
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Recursos vitales para el mantenimiento del refugio (comida, agua potable, medicinas básicas). Cada noche se consume una cantidad proporcional al número de habitantes. Si los suministros se agotan, la tasa de mortalidad en el refugio se dispara un 50% por cada ciclo de carestía.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-cyan-400 bg-cyan-400/5">
                                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-bolt"></i> ENERGÍA DE ESCANEO
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Los rayos en el HUD indican la carga disponible para realizar escaneos profundos (herramientas). Esta energía se regenera lentamente con el tiempo o se recupera parcialmente al finalizar el proceso de un sujeto.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tools Section */}
                    <div id="db-tools" className="db-section hidden space-y-6">
                        <h3 className="text-2xl text-blue-400 border-b border-blue-900 pb-2 font-bold uppercase tracking-tighter">
                            Instrumental de Inspección
                        </h3>
                        <div className="space-y-6 text-lg">
                            <div className="p-4 border-l-4 border-blue-400 bg-blue-400/5">
                                <h4 className="text-blue-400 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-temperature-half"></i> TERMÓMETRO CLÍNICO
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Detecta anomalías térmicas. Los sujetos infectados por el parásito 'Cloro' suelen mostrar una temperatura corporal basal inferior a 35.5°C, debido a que el parásito ralentiza el metabolismo humano para priorizar su propio crecimiento cristalino.
                                </p>
                                <p className="text-xs text-blue-300 mt-2 italic">Valores Normales: 36.5°C - 37.2°C</p>
                            </div>
                            <div className="p-4 border-l-4 border-purple-400 bg-purple-400/5">
                                <h4 className="text-purple-400 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-lightbulb"></i> LINTERNA DE ESPECTRO UV
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Revela la "Piel de Cloro". El parásito secreta una sustancia similar al hipoclorito sódico que es invisible al ojo humano pero fluoresce intensamente bajo luz ultravioleta, especialmente en zonas de piel fina, mucosas o heridas recientes.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-red-500 bg-red-500/5">
                                <h4 className="text-red-500 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-heart-pulse"></i> SENSOR DE PULSO
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Mide la frecuencia cardíaca. Una bradicardia extrema (pulso inferior a 50 ppm en reposo) suele ser un indicador de colonización del sistema nervioso central, lo que reduce drásticamente la respuesta emocional del huésped.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-green-500 bg-green-500/5">
                                <h4 className="text-green-500 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-eye"></i> EXAMEN DE PUPILAS
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Busca midriasis fija (pupilas dilatadas que no reaccionan a la luz) o anisocoria. Esto indica que el nervio óptico ha sido sustituido por filamentos parasitarios, eliminando el reflejo fotomotor.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Protocols Section */}
                    <div id="db-protocols" className="db-section hidden space-y-6">
                        <h3 className="text-2xl text-blue-400 border-b border-blue-900 pb-2 font-bold uppercase tracking-tighter">
                            Protocolos de Actuación
                        </h3>
                        <div className="space-y-6 text-lg">
                            <div className="p-4 border-l-4 border-cyan-400 bg-cyan-400/5">
                                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-check-double"></i> PROCESO DE ADMISIÓN
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Solo los sujetos que no presenten síntomas claros de infección deben ser admitidos. En caso de duda razonable, es preferible ignorar al sujeto que arriesgar la integridad del refugio. Recuerde que cada admisión consume suministros cada noche.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-orange-500 bg-orange-500/5">
                                <h4 className="text-orange-500 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-skull-crossbones"></i> PROTOCOLO DE PURGA
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Si un sujeto admitido muestra signos de infección una vez dentro del refugio, debe ser purgado inmediatamente. Tenga en cuenta que purgar civiles (ya sea por sospecha o error) aumenta drásticamente el nivel de paranoia en el sector.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-500/5">
                                <h4 className="text-yellow-500 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-plug-circle-bolt"></i> PROTOCOLOS DE ENERGÍA
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">Gestión del Generador Central RUTA-01. El sistema opera en tres modos con capacidades de carga (slots) y consumos variables:</p>
                                <ul className="mt-2 space-y-2 text-sm text-gray-400 font-mono">
                                    <li><span className="text-cyan-400 font-bold">AHORRO (SAVE):</span> 1 Slot. Consumo Mínimo. Mantiene sistemas vitales pero limita operaciones simultáneas. Sin riesgo de fallo.</li>
                                    <li><span className="text-green-400 font-bold">NORMAL:</span> 2 Slots. Consumo Estándar. Balance óptimo para operaciones diarias.</li>
                                    <li><span className="text-orange-500 font-bold">SOBRECARGA (OVERLOAD):</span> 3 Slots. Consumo Crítico. Permite operaciones masivas pero aumenta drásticamente el desgaste y riesgo de fallo (25%).</li>
                                </ul>
                                <p className="text-xs text-yellow-500 mt-2 italic">NOTA: La recarga con combustible añade un 25% de batería por bidón.</p>
                            </div>
                        </div>
                    </div>

                    {/* Traits Section */}
                    <div id="db-traits" className="db-section hidden space-y-6">
                        <h3 className="text-2xl text-blue-400 border-b border-blue-900 pb-2 font-bold uppercase tracking-tighter">
                            Análisis de Perfiles Psicológicos
                        </h3>
                        <p className="text-xs text-blue-300 italic">Clasificación de supervivientes según su impacto en la micro-comunidad del refugio.</p>
                        <div className="space-y-6 text-lg">
                            <div className="p-4 border-l-4 border-blue-400 bg-blue-400/5">
                                <h4 className="text-blue-400 font-bold flex items-center gap-2 uppercase">Recolector</h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Individuos con alta capacidad logística. Tienen un 40% de probabilidad de encontrar suministros extra (1-5 unidades) durante las incursiones nocturnas fuera de su zona de descanso.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-green-400 bg-green-400/5">
                                <h4 className="text-green-400 font-bold flex items-center gap-2 uppercase">Optimista</h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Personalidad resiliente que ayuda a mantener la calma. Cada ciclo que sobreviven en el refugio, otorgan un bono de -10% de Paranoia al operador al reducir la tensión del grupo.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-red-400 bg-red-400/5">
                                <h4 className="text-red-400 font-bold flex items-center gap-2 uppercase">Paranoico</h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Individuos inestables que propagan rumores infundados. Su presencia aumenta el nivel de Paranoia general en +5% cada ciclo, dificultando las operaciones de seguridad.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-amber-600 bg-amber-600/5">
                                <h4 className="text-amber-600 font-bold flex items-center gap-2 uppercase">Enfermizo</h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Sujetos con metabolismo acelerado o necesidades médicas crónicas. Consumen el doble de suministros (2 unidades) cada noche, independientemente de su estado de infección.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-cyan-500 bg-cyan-500/5">
                                <h4 className="text-cyan-500 font-bold flex items-center gap-2 uppercase">Resistente</h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    Alta capacidad de supervivencia. En caso de brecha de seguridad interna o ataque nocturno, estos individuos tienen mayor probabilidad de ser los últimos supervivientes del sector.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Professions Section (New) */}
                    <div id="db-professions" className="db-section hidden space-y-6">
                        <h3 className="text-2xl text-blue-400 border-b border-blue-900 pb-2 font-bold uppercase tracking-tighter">
                            Base de Datos de Profesiones
                        </h3>
                        <p className="text-xs text-blue-300 italic">Especializaciones laborales y su impacto en la eficiencia del refugio.</p>
                        <div className="space-y-6 text-lg">
                            <div className="p-4 border-l-4 border-blue-400 bg-blue-400/5">
                                <h4 className="text-blue-400 font-bold uppercase">Ingeniería y Mantenimiento</h4>
                                <ul className="mt-2 space-y-2 text-sm text-gray-300">
                                    <li><strong className="text-white">Ingeniero:</strong> Reduce el consumo del generador un 15% cuando se asigna a Energía.</li>
                                    <li><strong className="text-white">Electricista:</strong> Reduce el consumo del generador un 10% cuando se asigna a Energía.</li>
                                </ul>
                            </div>
                            <div className="p-4 border-l-4 border-green-400 bg-green-400/5">
                                <h4 className="text-green-400 font-bold uppercase">Salud y Supervivencia</h4>
                                <ul className="mt-2 space-y-2 text-sm text-gray-300">
                                    <li><strong className="text-white">Médico:</strong> Reduce la mortalidad en el refugio un 30% (Efecto Pasivo).</li>
                                    <li><strong className="text-white">Suturador:</strong> Reduce la mortalidad en el refugio un 15% (Efecto Pasivo).</li>
                                    <li><strong className="text-white">Cocinero:</strong> Optimiza las raciones, aumentando su rendimiento un 20% (Si asignado a Suministros).</li>
                                </ul>
                            </div>
                            <div className="p-4 border-l-4 border-red-400 bg-red-400/5">
                                <h4 className="text-red-400 font-bold uppercase">Seguridad</h4>
                                <ul className="mt-2 space-y-2 text-sm text-gray-300">
                                    <li><strong className="text-white">Soldado:</strong> Reduce la probabilidad de robos internos un 40% (Si asignado a Seguridad).</li>
                                    <li><strong className="text-white">Seguridad:</strong> Reduce la probabilidad de robos internos un 25% (Si asignado a Seguridad).</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Threats Section */}
                    <div id="db-threats" className="db-section hidden space-y-6">
                        <h3 className="text-2xl text-alert border-b border-alert/30 pb-2 font-bold uppercase tracking-tighter">
                            Análisis Biológico: La Amenaza
                        </h3>
                        <div className="space-y-6 text-lg">
                            <div className="p-4 border-l-4 border-green-500 bg-green-500/5">
                                <h4 className="text-green-500 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-dna"></i> NATURELEZA DEL PATÓGENO
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    El organismo responsable es un parásito fúngico-sintético de origen desconocido. Sustituye gradualmente los tejidos blandos por una estructura cristalina porosa que emite un fuerte olor a cloro. Se transmite por contacto directo, fluidos y esporas en ambientes cerrados.
                                </p>
                            </div>
                            <div className="p-4 border-l-4 border-red-600 bg-red-600/5">
                                <h4 className="text-red-600 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-biohazard"></i> ESTADIOS DE LA INFECCIÓN
                                </h4>
                                <p className="text-gray-300 mt-2 leading-relaxed">
                                    <span className="text-white font-bold block mb-1">1. Incubación:</span> Temperatura levemente baja, fatiga extrema, historias incoherentes.
                                    <span className="text-white font-bold block mb-1 mt-3">2. Colonización:</span> Manchas UV visibles en rostro y manos, bradicardia severa.
                                    <span className="text-white font-bold block mb-1 mt-3">3. Transformación:</span> Pupilas dilatadas fijas, pérdida total de la empatía, alteración de la conducta. En este estadio, el sujeto deja de ser humano y se convierte en un vector de dispersión.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Section (Phase 5.2) */}
                    <div id="db-analysis" className="db-section hidden space-y-6">
                        <h3 className="text-2xl text-cyan-400 border-b border-cyan-900/40 pb-2 font-bold uppercase tracking-tighter">
                            Historial Psicosomático
                        </h3>
                        <p className="text-xs text-cyan-500 italic">Análisis profundo de los sujetos residentes en el refugio.</p>

                        <div id="db-analysis-list" className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="text-blue-900 italic text-center py-8">Iniciando escaneo de residentes...</div>
                        </div>

                        <div id="db-analysis-detail" className="hidden p-6 border border-cyan-900/30 bg-black/40 animate__animated animate__fadeIn"></div>
                    </div>
                </div>
            </div>

            <footer className="flex justify-between items-center text-sm text-blue-900 font-mono uppercase border-t border-blue-900/20 pt-2">
                <span>Terminal ID: RUTA-01-DB</span>
                <span>No imprimir este documento.</span>
            </footer>
        </section>
    );
};
