import ReactPlayer from "react-player";
import "./cuerpo.css";
export default function VideoBox() {
    return (
        <div className="contenedor">
            <h1 center>Inducción GxP</h1>
            <div className="cuerpoplayer">
                <div className="player-wrapper">
                    <ReactPlayer
                        className="react-player"
                        src="https://www.youtube.com/watch?v=s3a4OQR-10M"
                        width="100%"
                        height="100%"
                        controls={true}
                        playing={true}
                        muted={true}
                    />
                </div>
            </div>
        </div>
    );
}
