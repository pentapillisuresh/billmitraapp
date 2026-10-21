import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Button } from '../components/ui';
import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function BillSuccess() {
  const p=useLocalSearchParams();
  const { bills }=useApp();
  const bill=bills.find(x=>x.id===String(p.billId)) || bills[0];

  return <ScrollView style={{flex:1,backgroundColor:C.bg}} contentContainerStyle={{paddingBottom:110}}>
    <Header title="Bill Generated" />
    <View style={{padding:16}}>
      <Card>
        <View style={{width:72,height:72,borderRadius:36,backgroundColor:'#DCFCE7',alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
          <Ionicons name="checkmark" size={42} color="#15803D"/>
        </View>
        <Text style={{textAlign:'center',fontSize:22,fontWeight:'900',color:'#15803D',marginTop:14}}>Bill Generated Successfully</Text>
        <Text style={{textAlign:'center',fontSize:11,color:C.muted,marginTop:5}}>Live stock has been updated.</Text>
        {bill && <>
          <View style={{height:1,backgroundColor:C.border,marginVertical:16}}/>
          <Row label="Bill No" value={bill.billNo}/>
          <Row label="Amount" value={`₹${Number(bill.total).toFixed(2)}`} bold/>
          <Row label="Payment" value={bill.paymentMethod}/>
          <Row label="Date" value={`${bill.date} ${bill.time}`}/>
        </>}
      </Card>

      {bill && <Card>
        <Text style={{fontWeight:'900',fontSize:15}}>Stock Updated</Text>
        <Text style={{fontSize:10,color:C.muted,marginTop:4}}>Only Live Stock decreased. Reserve Stock was unchanged.</Text>
        {bill.cart.map(line=>{
          return <View key={line.id} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#F0EDF4'}}>
            <Text style={{fontWeight:'700'}}>{line.name}</Text><Text style={{fontWeight:'900',color:C.primary}}>−{line.qty}</Text>
          </View>
        })}
      </Card>}

      <Button title="Print Bill" icon="print-outline" onPress={()=>{}}/>
      <View style={{height:10}}/>
      <Button title="Share / Download PDF" icon="share-outline" secondary onPress={()=>{}}/>
      <View style={{height:10}}/>
      <Button title="Done" icon="checkmark-outline" onPress={()=>router.replace('/(tabs)/billing')}/>
    </View>
  </ScrollView>;
}
function Row({label,value,bold}) {
  return <View style={{flexDirection:'row',justifyContent:'space-between',marginVertical:5}}><Text style={{fontWeight:bold?'900':'500'}}>{label}</Text><Text style={{fontWeight:bold?'900':'800',color:bold?C.primary:C.text}}>{value}</Text></View>;
}
