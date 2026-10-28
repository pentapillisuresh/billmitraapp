
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProductRequestProvider } from '../../context/ProductRequestContext';

export default function ProductRequestsLayout() {
  return (
    <ProductRequestProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#F7F8FA',
          },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Request Dashboard',
          }}
        />

        <Stack.Screen
          name="add"
          options={{
            title: 'Add Product Request',
          }}
        />

        <Stack.Screen
          name="select-products"
          options={{
            title: 'Select Products',
          }}
        />

        <Stack.Screen
          name="all"
          options={{
            title: 'All Requests',
          }}
        />

        <Stack.Screen
          name="[id]"
          options={{
            title: 'Request Details',
          }}
        />
      </Stack>
    </ProductRequestProvider>
  );
}
