import React, { useEffect, useState, ChangeEvent, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";
import { useForm } from "react-hook-form";

import "./styles.css";
import logo from "../../assets/logo.svg";
import Dropzone from "../../components/Dropzone";

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

interface Inputs {
  name: string;
  email: string;
  whatsapp: number;
  latitude: number;
  longitude: number;
  uf: string;
  city: string;
  items: number[];
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [hiddenResp, setHiddenResp] = useState<boolean>(true);

  const [oneSubmit, setOneSubmit] = useState<number>(0);

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

  useEffect(() => {}, [oneSubmit]);

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

  // const handleSubmit = async (event: FormEvent) => {
  //   event.preventDefault();

  //   const { name, email, whatsapp } = formData;
  //   const uf = selectedUf;
  //   const city = selectedCity;
  //   const [latitude, longitude] = selectedPosition;
  //   const items = selectedItems;

  //   const data = new FormData();

  //   if (selectedFile) {
  //     data.append("name", name);
  //     data.append("email", email);
  //     data.append("whatsapp", whatsapp);
  //     data.append("latitude", String(latitude));
  //     data.append("longitude", String(longitude));
  //     data.append("uf", uf);
  //     data.append("city", city);
  //     data.append("items", items.join(","));
  //     data.append("image", selectedFile);

  //     await api.post("points", data);

  //     setSuccess(true);
  //     setHiddenResp(false);
  //     setTimeout(() => history.push("/"), 2000);
  //   } else {
  //     setSuccess(false);
  //     setHiddenResp(false);
  //     setTimeout(() => setHiddenResp(true), 2000);
  //   }

  //   return;
  // };

  const { register, handleSubmit, errors } = useForm<Inputs>();

  const onSubmit = async (formData: Inputs) => {
    setOneSubmit(oneSubmit + 1);
    if (
      JSON.stringify(selectedPosition) !== JSON.stringify([0, 0]) &&
      selectedFile &&
      selectedItems.length > 0
    ) {
      const { city, email, items, latitude, longitude, name, uf, whatsapp } = {
        ...formData,
        latitude: selectedPosition[0],
        longitude: selectedPosition[1],
        items: selectedItems,
      };

      const data = new FormData();

      data.append("name", name);
      data.append("email", email);
      data.append("whatsapp", String(whatsapp));
      data.append("latitude", String(latitude));
      data.append("longitude", String(longitude));
      data.append("uf", uf);
      data.append("city", city);
      data.append("items", items.join(","));
      data.append("image", selectedFile);

      await api.post("points", data);

      setHiddenResp(false);
      setTimeout(() => history.push("/"), 2000);
    }
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>
            Cadastro do <br /> ponto de coleta
          </h1>

          <Dropzone onFileUploaded={setSelectedFile} />
          {!selectedFile && oneSubmit > 0 && (
            <span className="invalid">Por favor, selecione uma imagem.</span>
          )}

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">
                Nome da entidade
                {errors.name && (
                  <span className="invalid"> (Insira um nome válido)</span>
                )}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
                ref={register({ required: true })}
              />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">
                  E-mail
                  {errors.email && (
                    <span className="invalid"> (Insira um email válido)</span>
                  )}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                  ref={register({ required: true })}
                />
              </div>

              <div className="field">
                <label htmlFor="whatsapp">
                  Whatsapp
                  {errors.whatsapp && (
                    <span className="invalid"> (Insira um número válido.)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                  ref={register({ required: true })}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>
                {JSON.stringify(selectedPosition) === JSON.stringify([0, 0]) &&
                  oneSubmit > 0 && (
                    <span className="invalid">
                      (Marque a posição do ponto de coleta)
                    </span>
                  )}
                Selecione o endereço no mapa
              </span>
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
                <label htmlFor="uf">
                  Estado (UF)
                  {errors.uf && (
                    <span className="invalid"> (Selecione uma UF.)</span>
                  )}
                </label>
                <select
                  name="uf"
                  id="uf"
                  value={selectedUf}
                  onChange={handleSelectedUf}
                  ref={register({ required: true, maxLength: 2 })}
                >
                  <option value="">Selecione uma UF</option>
                  {ufs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="city">
                  Cidade
                  {errors.city && (
                    <span className="invalid"> (Selecione uma cidade.)</span>
                  )}
                </label>
                <select
                  name="city"
                  id="city"
                  value={selectedCity}
                  onChange={handleSelectedCity}
                  ref={register({ required: true })}
                >
                  <option value="">Selecione uma cidade</option>
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
              <span
                className={
                  selectedItems.length === 0 && oneSubmit > 0 ? "invalid" : ""
                }
              >
                Selecione um ou mais itens abaixo
              </span>
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

          {(!selectedFile ||
            JSON.stringify(selectedPosition) === JSON.stringify([0, 0]) ||
            selectedItems.length === 0) &&
            oneSubmit > 0 && (
              <span className="invalid">Informações inválidas!</span>
            )}
          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
      <div
        className="result"
        hidden={hiddenResp}
        onClick={() => setHiddenResp(true)}
      >
        <div>
          <FiCheckCircle color="#34CB79" size={175} />
          <span>Cadastro realizado com sucesso!</span>
        </div>
      </div>
    </>
  );
};

export default CreatePoint;
