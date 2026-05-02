import React from 'react'
import { isEmpty } from 'lodash'
import { SelectList } from 'react-native-dropdown-select-list'

export default function DropdownField(props) {
  const [selected, setSelected] = React.useState(props.value)
  const [selectionData, setSelectionData] = React.useState({})

  if (Array.isArray(props.data) && isEmpty(selectionData)) {
    const scrubbedData = props.data.map((option) => ({ key: option, value: option }))
    scrubbedData.unshift({ key: '', value: '' })
    setSelectionData(scrubbedData)
  }

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
