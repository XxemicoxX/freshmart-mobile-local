import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TemaProvider, useTema } from './src/context/TemaContext';
import { AuthProvider } from './src/context/AuthContext';
import { CarritoProvider } from './src/context/CarritoContext';
import AppNavigator from './src/navigation/AppNavigator';

// La clave (tema) hace que toda la interfaz se vuelva a dibujar con la nueva paleta al cambiar de tema
function Raiz() {
  const { tema } = useTema();
  return (
    <AuthProvider>
      <CarritoProvider>
        <StatusBar style="light" />
        <AppNavigator key={tema} />
      </CarritoProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <Raiz />
      </TemaProvider>
    </SafeAreaProvider>
  );
}
