import React from 'react';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {AppProvider} from '../context/AppContext';

export default function Layout() {
  return <AppProvider>
    <StatusBar style="dark"/>
    <Stack screenOptions={{headerShown:false, animation:'slide_from_right'}}/>
  </AppProvider>;
}
