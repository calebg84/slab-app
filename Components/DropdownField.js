import React from 'react'
import { isEmpty } from 'lodash'

import { SelectList } from 'react-native-dropdown-select-list'
// https://www.npmjs.com/package/react-native-dropdown-select-list

export default function App(props) {
  const [selected, setSelected] = React.useState(props.value)
  const [selectionData, setSelectionData] = React.useState({})

  if (Array.isArray(props.data) && isEmpty(selectionData)) {
    let scrubbedData = props.data.map((option) => {
      return { key: option, value: option }
    })
    scrubbedData.unshift({ key: '', value: '' })
    setSelectionData(scrubbedData)
  }
  // const data = [
  //   { key: '1', value: 'Mobiles', disabled: true },
  //   { key: '2', value: 'Appliances' },
  //   { key: '3', value: 'Cameras' },
  //   { key: '4', value: 'Computers', disabled: true },
  //   { key: '5', value: 'Vegetables' },
  //   { key: '6', value: 'Diary Products' },
  //   { key: '7', value: 'Drinks' },
  // ]

  return (
    <SelectList
      setSelected={(val) => {
        setSelected(val)
        props.setSelected(val)
      }}
      onSelect={(val) => {
        if (!val) {
          setSelected('')
        }
      }}
      data={selectionData}
      save='value'
      search
    />
  )
}
