import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, ImageBackground, Image, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';


import styles, { pickerSelectStyles } from './styles';

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const Home = () => {
  const navigation = useNavigation();

  const [selectedUf, setSelectedUf] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  function handleNavigateToPoints() {
    navigation.navigate('Points', {
      uf: selectedUf, city: selectedCity
    });
  }

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla).sort();
        setUfs(ufInitials);
      });

  }, []);

  useEffect(() => {
    if (selectedUf === '0') return;

    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome).sort();
        setCities(cityNames);
      });

  }, [selectedUf]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={require('../../assets/home-background.png')}
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu market place de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessaos a encontrarem pontos de coleta de forma eficiente</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{ label: 'Selecione o Estado', value: null}}
            onValueChange={value => setSelectedUf(value)}
            items={ufs.map(
              uf => { return { key: uf, label: uf, value: uf } }
            )}
            Icon={() => <Icon name="chevron-down" size={35} color="black" />}
          />

          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{ label: 'Selecione a cidade', value: null}}
            onValueChange={value => setSelectedCity(value)}
            items={cities.map(
              city => { return { key: city, label: city, value: city } }
            )}
            Icon={() => <Icon name="chevron-down" size={35} color="black" />}
          />


          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
          </Text>
          </RectButton>
        </View>

      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

export default Home;