import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput } from 'react-native'

const TextField = (props) => {
  const [newText, setNewText] = useState('')

  return (
    <View style={styles.textField}>
      <Text
        style={{ height: 70, fontSize: 20, paddingTop: 20, paddingRight: 15 }}
      >
        {props.fieldName}:{' '}
      </Text>
      <TextInput
        style={{
          height: 70,
          fontSize: 20,
          borderColor: 'black',
          borderWidth: 2,
          borderRadius: 18,
          width: 200,
          padding: 5,
        }}
        placeholder={`${props.fieldName}`}
        onChangeText={(newText) => {
          //   setNewText(newText)
          props.callBack(newText)
        }}
        defaultValue={props.value}
      />
    </View>
  )
}

export default TextField

const styles = StyleSheet.create({
  textField: {
    flexDirection: 'row',
    width: 350,
    margin: 10,
  },
})
