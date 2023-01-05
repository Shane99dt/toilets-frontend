import { Icon } from "leaflet";
import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Tooltip,
  useMapEvent,
  Popup,
} from "react-leaflet";

const Map = () => {
  const [r, setR] = useState(10);
  const [toilets, setToilets] = useState([]);
  const [position, setPosition] = useState({ lat: "48.8584", lng: "2.2945" });
  const formRef = useRef();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  useEffect(() => {
    fetchToilets();
  }, [position]);

  useEffect(() => {
    fetchToilets(r);
  }, [r]);

  const fetchToilets = async () => {
    const request = await fetch(
      `http://localhost:5000/toilet?r=${r}&lat=${position.lat}&lng=${position.lng}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const response = await request.json();
    setToilets(response);
  };

  function SetViewOnClick({ animateRef }) {
    const map = useMapEvent("click", (e) => {
      map.setView(e.latlng, map.getZoom(), {
        animate: false,
      });
    });

    return null;
  }

  const myPositionMarker = new Icon({
    iconUrl:
      "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-PNG-HD-180x180.png",
    iconSize: [40, 40],
  });

  const toiletMarker = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.2/dist/images/marker-icon-2x.png",
    iconSize: [32, 50],
  });

  const handleRadiusChange = (e) => {
    setR(e.target.value);
  };

  const handleLatChange = (e) => {
    setPosition({
      ...position,
      lat: e.target.value,
    });
  };

  const handleLngChange = (e) => {
    setPosition({
      ...position,
      lng: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetchToilets();
  };

  return (
    <>
      <div>
        <div className="absolute top-0 right-0 z-10 bg-white px-5 py-2 bg-slate-100 rounded-md">
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={r}
            onChange={handleRadiusChange}
          />
          <label className="ml-5 py-2">{r}</label>

          <form onSubmit={handleSubmit} ref={formRef}>
            <input
              type="number"
              value={position.lat}
              onChange={handleLatChange}
              className={
                "border-slate-500 border-2 mr-2 px-1 rounded-md hover:bg-slate-100"
              }
            />
            <input
              type="number"
              value={position.lng}
              onChange={handleLngChange}
              className={
                "border-slate-500 border-2 mr-2 px-1 rounded-md hover:bg-slate-100"
              }
            />

            <button type="submit">SUBMIT</button>
          </form>
        </div>
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          scrollWheelZoom={true}
          className={"z-0"}
          style={{
            height: "100vh",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SetViewOnClick />
          <Circle
            center={[position.lat, position.lng]}
            radius={r}
            color={"#FF0000"}
          />
          <Marker
            position={[position.lat, position.lng]}
            icon={myPositionMarker}
          />

          {toilets.map((toilet) => {
            return (
              <Marker
                position={[
                  toilet.position.coordinates[1],
                  toilet.position.coordinates[0],
                ]}
                icon={toiletMarker}
                key={toilet.id}
              >
                <Popup>
                  <h2>{toilet.address}</h2>
                  <p>{toilet.arrondissement}</p>
                  <p>{toilet.hours}</p>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </>
  );
};

export default Map;
