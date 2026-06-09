/**
 * bootstrap.jsx - Punto de entrada de React en el navegador.
 * Busca todos los contenedores [data-react] e inyecta su respectivo componente.
 * Utiliza MountNotifier para coordinar la inicialización con el script principal del juego (main.js).
 */

class MountNotifier extends React.Component {
  componentDidMount() {
    if (this.props.onMount) {
      this.props.onMount();
    }
  }
  render() {
    return this.props.children;
  }
}

const initReact = () => {
  const COMPONENT_MAP = {
    // Shared
    'panel-screws': window.RC.PanelScrews,
    'modal-shell': window.RC.ModalShell,
    'audio-settings': window.RC.AudioSettings,
    'dev-config-panel': window.RC.DevConfigPanel,

    // Modales
    'modal-endings': window.RC.ModalEndings,
    'modal-pause': window.RC.ModalPause,
    'modal-settings': window.RC.ModalSettings,
    'modal-message': window.RC.ModalMessage,
    'modal-confirm': window.RC.ModalConfirm,
    'modal-npc': window.RC.ModalNPC,
    'modal-tutorial': window.RC.ModalTutorial,
    'modal-lore': window.RC.ModalLore,
    'modal-validation': window.RC.ModalValidation,
    'modal-relocate': window.RC.ModalRelocate,

    // Screens
    'screen-start': window.RC.ScreenStart,
    'screen-meditation': window.RC.ScreenMeditation,
    'screen-fuel-room': window.RC.ScreenFuelRoom,
    'screen-supplies-hub': window.RC.ScreenSuppliesHub,
    'screen-expedition': window.RC.ScreenExpedition,
    'screen-log': window.RC.ScreenLog,
    'screen-morgue': window.RC.ScreenMorgue,
    'screen-final-stats': window.RC.ScreenFinalStats,
    'screen-database': window.RC.ScreenDatabase,
  };

  const targets = document.querySelectorAll('[data-react]');
  const totalTargets = targets.length;
  let mountedCount = 0;

  if (totalTargets === 0) {
    window.reactReady = true;
    document.dispatchEvent(new Event('react-ready'));
    return;
  }

  const handleMount = () => {
    mountedCount++;
    if (mountedCount === totalTargets) {
      window.reactReady = true;
      document.dispatchEvent(new Event('react-ready'));
    }
  };

  targets.forEach(el => {
    const name = el.dataset.react;
    const Component = COMPONENT_MAP[name];
    if (Component) {
      const root = ReactDOM.createRoot(el);
      root.render(
        React.createElement(
          MountNotifier,
          { onMount: handleMount },
          React.createElement(Component)
        )
      );
    } else {
      console.warn(`React component not found for key: ${name}`);
      handleMount();
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReact);
} else {
  initReact();
}

