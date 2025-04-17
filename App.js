import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Alert, ScrollView, Text } from 'react-native'
import { app } from './firebaseConfig'
import { getFirestore } from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import Button from './Components/Button'
import DropdownField from './Components/DropdownField'
import TextField from './Components/TextField'
import * as ImagePicker from 'expo-image-picker'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { Logs } from 'expo'

// Logs.enableExpoCliLogging()

export default function App() {
  const initialState = {
    species: '',
    stockID: '',
    downloadUrls: [],
    description: '',
    length: '',
    maxWidth: '',
    minWidth: '',
    price: '',
    thickness: '',
    green: false,
  }
  const [selectedImages, setSelectedImages] = useState([])
  const [
    {
      species,
      stockID,
      downloadUrls,
      description,
      length,
      maxWidth,
      minWidth,
      price,
      thickness,
      green,
    },
    setState,
  ] = useState(initialState)
  // const [selectedSpecies, setSelectedSpecies] = useState([])
  // const [newStockId, setNewStockId] = useState('')
  // const [downloadUrls, setDownloadUrls] = useState([])
  // const [description, setDescription] = useState('')
  // const [length, setLength] = useState('')
  // const [maxWidth, setMaxWidth] = useState('')
  // const [minWidth, setMinWidth] = useState('')
  // const [price, setprice] = useState('')
  // const [thickness, setThickness] = useState('')

  const onChange = ({ name, value }) => {
    return setState((prevState) => ({ ...prevState, [name]: value }))
  }
  const clearState = () => {
    return setState({ ...initialState })
  }

  const db = getFirestore(app)

  const speciesList = [
    'Alder',
    'Ash',
    'Beech',
    'Birch',
    'Box elder',
    'Butternut',
    'Cedar',
    'Cherry',
    'Cypress',
    'Elm',
    'Hackberry',
    'Hickory',
    'Locust - Black',
    'Locust - Honey',
    'Maple - Soft',
    'Maple - Hard',
    'Oak - Red',
    'Oak - White',
    'Pine',
    'Poplar',
    'Sweetgum',
    'Sycamore',
    'Walnut - Black',
  ]
  const sendDocToDb = async () => {
    try {
      if (
        !species ||
        !stockID ||
        downloadUrls.length < 1 ||
        !length ||
        !maxWidth ||
        !minWidth ||
        !price ||
        !thickness
      ) {
        Alert.alert('There are fields with missing values')
        console.log({
          species: species,
          stockID: stockID,
          imageURI: downloadUrls,
          description: description,
          length: length,
          maxWidth: maxWidth,
          minWidth: minWidth,
          price: price,
          thickness: thickness,
          green: green,
        })
      } else {
        const docRef = await addDoc(collection(db, 'slabs'), {
          species: species,
          stockID: stockID,
          imageURI: downloadUrls,
          description: description,
          length: length,
          maxWidth: maxWidth,
          minWidth: minWidth,
          price: price,
          thickness: thickness,
          green: green,
        })
        Alert.alert(`Document written with ID: ${docRef.id}`)
        clearState()
        setSelectedImages([])
      }
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  const getDocsFromDb = async () => {
    let docs = new Set()
    try {
      const querySnapshot = await getDocs(collection(db, 'slabs'))
      querySnapshot.forEach((doc) => {
        let newData = doc.data()
        docs.add(newData)
      })
      return [...docs]
    } catch (e) {
      console.error('Error fetching documents: ', e)
    }
  }

  const filterData = async (val) => {
    let data = await getDocsFromDb()
    let prefix
    let largestIdNumber
    let newStockId
    let filteredData =
      data.length > 0 && data.filter((obj) => obj.species === val)
    console.log('filteredData: ', filteredData)
    if (filteredData.length > 0) {
      let existingIds = filteredData.map((obj) => obj.stockID)
      console.log('existingIds: ', existingIds)
      largestIdNumber = Math.max(
        ...existingIds.map((id) => {
          console.log('id is: ', id)
          prefix = id.split('-')[0]
          return Number(id.split('-')[1])
        })
      )
      let stockNumber = (largestIdNumber + 1).toString()
      newStockId = `${prefix}-${stockNumber.padStart(3, '0')}`
    } else {
      console.log('species is: ', val)
      console.log('val.substring(0,2) is: ', val.substring(0, 2))
      console.log(
        'val.substring(0,2).toUpperCase() is: ',
        val.substring(0, 2).toUpperCase()
      )
      newStockId = `${val.substring(0, 2).toUpperCase()}-001`
    }
    onChange({ name: 'stockID', value: newStockId })
  }

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      // allowsEditing: true,
      allowsMultipleSelection: true,
      // quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 0,
    })

    if (!result.canceled) {
      setSelectedImages(result.assets)
      sendImages(result.assets)
    } else {
      alert('You did not select any image.')
    }
  }

  const uploadImages = async (img) => {
    let newDownloadUrls = []
    const storage = getStorage(app)
    try {
      await img.images.map(async (image, index) => {
        const imageResponse = await fetch(image.uri)
        const blob = await imageResponse.blob()
        const newFile = new File([blob], `${img.name}-${index}.jpeg`, {
          type: 'image/jpeg',
        })
        const storageRefUri = await ref(storage, `${img.name}-${index}.jpeg`)
        let upload = await uploadBytesResumable(storageRefUri, newFile)
        let downloadUrl = await getDownloadURL(upload.ref)
        await newDownloadUrls.push({ src: downloadUrl })
        Alert.alert(`image ${index + 1} uploaded`)
      })
      return onChange({ name: 'downloadUrls', value: newDownloadUrls })
    } catch (error) {
      console.error(error)
    }
  }

  const sendImages = (imgs) => {
    const img = {
      name: stockID,
      images: imgs,
    }
    uploadImages(img)
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <DropdownField
          data={speciesList}
          value={species}
          setSelected={(val) => {
            console.log('val in dropdown is: ', val)
            onChange({ name: 'species', value: val })
            filterData(val)
          }}
        />
                <Text>StockID is: {stockID} </Text>

        <DropdownField
          data={['Green', 'Dry']}
          value={green}
          setSelected={(val) => {
            onChange({ name: 'green', value: val === 'Green' ? true : false })
          }}
        />
        <TextField
          value={description}
          fieldName='Description'
          callBack={(val) => onChange({ name: 'description', value: val })}
        />
        <TextField
          value={length}
          fieldName='Length'
          callBack={(val) => onChange({ name: 'length', value: val })}
        />
        <TextField
          value={maxWidth}
          fieldName='Max Width'
          callBack={(val) => onChange({ name: 'maxWidth', value: val })}
        />
        <TextField
          value={minWidth}
          fieldName='Min Width'
          callBack={(val) => onChange({ name: 'minWidth', value: val })}
        />
        <TextField
          value={thickness}
          fieldName='Thickness'
          callBack={(val) => onChange({ name: 'thickness', value: val })}
        />
        <TextField
          value={price}
          fieldName='Price'
          callBack={(val) => onChange({ name: 'price', value: val })}
        />
        <Button
          theme='primary'
          label='Choose photos'
          onPress={pickImageAsync}
        />
        <Text>Images Selected: {selectedImages.length} </Text>
        <Button label='Save Slab to DB' onPress={sendDocToDb} />
        <StatusBar style='auto' />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 58,
    backgroundColor: 'white',
  },
  textField: {
    marginVertical: 20,
  },
  image: {
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 2,
    alignItems: 'center',
  },
})

// 'file' comes from the Blob or File API
// storageRef
//   .child(`test/${img.name}.jpg`)
//   .put(img.uri)
//   .then((snapshot) => {
//     console.log('img uploaded')
//     console.log(snapshot)
//   })

// let testRef = await storageRef.child('test')
// let spaceRef = await testRef.child(`${img.name}.jpg`)
// await this.form.images.map(async (img) => {
// let imageObj = {}
// imageObj[img.name] = await storageRef.child(`${img.name}.jpg`)
// await imageObj[img.name].put(img)
// let url = await imageObj[img.name].getDownloadURL()
// let urlObj = {
//   src: url,
// }
// await this.form.imageURI.push(urlObj)
// })
// let imageObj = {}
// imageObj[this.form.primaryImage.name] = await storageRef.child(
//   `${this.form.primaryImage.name}.jpg`
// )
// await imageObj[this.form.primaryImage.name].put(this.form.primaryImage)
// let url = await imageObj[this.form.primaryImage.name].getDownloadURL()
// let urlObj = {
//   src: url,
// }
// await this.form.imageURI.unshift(urlObj)
// return console.log('this.form.imageURI: ', this.form.imageURI)
