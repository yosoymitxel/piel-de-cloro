/**
 * PanelScrews - Tornillos decorativos de panel industrial.
 * Reemplaza ~25 bloques repetidos de 4 divs en el monolito.
 */
window.RC = window.RC || {};
window.RC.PanelScrews = function PanelScrews() {
    return (
        <React.Fragment>
            <div className="panel-screw screw-tl"></div>
            <div className="panel-screw screw-tr"></div>
            <div className="panel-screw screw-bl"></div>
            <div className="panel-screw screw-br"></div>
        </React.Fragment>
    );
};
