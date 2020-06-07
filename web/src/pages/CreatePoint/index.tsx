import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";
import yup from "yup";

import "./styles.css";
import Dropzone from "../../components/Dropzone";
import pointSchema from "../../validation/PointSchema";

import logo from "../../assets/logo.svg";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

interface errsArray {
  path: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [errs, setErrs] = useState<string>("");

  const [hiddenResp, setHiddenResp] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla).sort();
        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === "0") return;

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome).sort();
        setCities(cityNames);
      });
  }, [selectedUf]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  const handleSelectedUf = (event: ChangeEvent<HTMLSelectElement>) => {
    const uf = event.target.value;
    setSelectedUf(uf);
  };

  const handleSelectedCity = (event: ChangeEvent<HTMLSelectElement>) => {
    const city = event.target.value;
    setSelectedCity(city);
  };

  const handleMapClick = (event: LeafletMouseEvent) => {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectedItem = (id: number) => {
    const alreadySelected = selectedItems.findIndex((item) => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    pointSchema
      .validate(
        {
          name,
          email,
          whatsapp,
          latitude,
          longitude,
          city,
          uf,
          items,
        },
        { abortEarly: false }
      )
      .then(async (res) => {
        if (selectedFile) {
          data.append("name", name);
          data.append("email", email);
          data.append("whatsapp", whatsapp);
          data.append("latitude", String(latitude));
          data.append("longitude", String(longitude));
          data.append("uf", uf);
          data.append("city", city);
          data.append("items", items.join(","));
          data.append("image", selectedFile);

          await api.post("points", data);

          setSuccess(true);
          setHiddenResp(false);
          setTimeout(() => history.push("/"), 2000);
        } else {
          setErrs("image");
          setSuccess(false);
          setHiddenResp(false);
          setTimeout(() => setHiddenResp(true), 2000);
        }
      })
      .catch((err) => {
        let erros = err.inner
          .map((errsArray: errsArray) => errsArray.path)
          .join(", ");
        if (!selectedFile) erros = "image, " + erros;
        setErrs(erros);
        setSuccess(false);
        setHiddenResp(false);
      });

    return;
  };

  return (
    <>
      <div id="page-create-point">
        <header>
          <img src={logo} alt="Logomarca do ecoleta" />
          <Link to="/">
            <FiArrowLeft />
            Voltar para home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do <br /> ponto de coleta
          </h1>

          <Dropzone onFileUploaded={setSelectedFile} />

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
              />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                />
              </div>

              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>

            <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={selectedPosition} />
            </Map>

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select
                  name="uf"
                  id="uf"
                  value={selectedUf}
                  onChange={handleSelectedUf}
                >
                  <option value="0">Selecione uma UF</option>
                  {ufs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select
                  name="city"
                  id="city"
                  value={selectedCity}
                  onChange={handleSelectedCity}
                >
                  <option value="0">Selecione uma cidade</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
            </legend>

            <ul className="items-grid">
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectedItem(item.id)}
                  className={selectedItems.includes(item.id) ? "selected" : ""}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </fieldset>

          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
      <div
        className="result"
        hidden={hiddenResp}
        onClick={() => setHiddenResp(true)}
      >
        <div hidden={!success}>
          <FiCheckCircle color="#34CB79" size={175} />
          <span>Cadastro realizado com sucesso!</span>
        </div>
        <div hidden={success}>
          <FiXCircle color="rgb(209, 71, 71)" size={175} />
          <span>
            Informações inválidas!
            <br />
            {errs}
          </span>
        </div>
      </div>
    </>
  );
};

export default CreatePoint;
