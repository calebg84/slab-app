import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Alert, ScrollView, Text, ActivityIndicator } from 'react-native'
import { app, storage } from './firebaseConfig'
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import Button from './Components/Button'
import DropdownField from './Components/DropdownField'
import TextField from './Components/TextField'
import * as ImagePicker from 'expo-image-picker'

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
  const [loading, setLoading] = useState(false)
  const [
    { species, stockID, downloadUrls, description, length, maxWidth, minWidth, price, thickness, green },
    setState,
  ] = useState(initialState)

  const onChange = ({ name, value }) => {
    setState((prevState) => ({ ...prevState, [name]: value }))
  }

  const clearState = () => {
    setState({ ...initialState })
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
      Alert.alert('Missing Fields', 'Please fill in all required fields.')
      return
    }

    setLoading(true)

    try {
      const docRef = await addDoc(collection(db, 'slabs'), {
        species,
        stockID,
        imageURI: downloadUrls,
        description,
        length,
        maxWidth,
        minWidth,
        price,
        thickness,
        green,
      })
      Alert.alert('Success', `Slab saved with ID: ${docRef.id}`)
      clearState()
      setSelectedImages([])
    } catch (e) {
      Alert.alert('Error', 'Failed to save slab. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDocsFromDb = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'slabs'))
      return querySnapshot.docs.map((doc) => doc.data())
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch existing slabs.')
      return []
    }
  }

  const filterData = async (val) => {
    const data = await getDocsFromDb()
    const filteredData = data.filter((obj) => obj.species === val)

    let newStockId
    if (filteredData.length > 0) {
      const largestIdNumber = Math.max(
        ...filteredData.map((obj) => Number(obj.stockID.split('-')[1]))
      )
      const prefix = filteredData[0].stockID.split('-')[0]
      newStockId = `${prefix}-${(largestIdNumber + 1).toString().padStart(3, '0')}`
    } else {
      newStockId = `${val.substring(0, 2).toUpperCase()}-001`
    }
    onChange({ name: 'stockID', value: newStockId })
  }

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0,
    })

    if (!result.canceled) {
      setSelectedImages(result.assets)
      sendImages(result.assets)
    } else {
      Alert.alert('Cancelled', 'No image selected.')
    }
  }

  const uploadImages = async (stockId, images) => {
    const urls = []
    try {
      const uploadPromises = images.map(async (image, index) => {
        const fileName = `${stockId}-${index}.jpeg`
        const imageResponse = await fetch(image.uri)
        const blob = await imageResponse.blob()
        const storageRef = ref(storage, fileName)
        const uploadSnapshot = await uploadBytesResumable(storageRef, blob)
        const downloadUrl = await getDownloadURL(uploadSnapshot.ref)
        return { src: downloadUrl }
      })

      const results = await Promise.all(uploadPromises)
      urls.push(...results)
      onChange({ name: 'downloadUrls', value: urls })
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload images. Please try again.')
    }
  }

  const sendImages = (images) => {
    uploadImages(stockID || 'temp', images)
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <DropdownField
          data={speciesList}
          value={species}
          setSelected={(val) => {
            onChange({ name: 'species', value: val })
            filterData(val)
          }}
        />

        <Text style={styles.stockIdText}>Stock ID: {stockID || 'N/A'}</Text>

        <DropdownField
          data={['Green', 'Dry']}
          value={green ? 'Green' : 'Dry'}
          setSelected={(val) => {
            onChange({ name: 'green', value: val === 'Green' })
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

        <Text style={styles.imageCountText}>
          Images Selected: {selectedImages.length}
        </Text>

        {loading ? (
          <ActivityIndicator size='large' color='#ffd33d' style={styles.loader} />
        ) : (
          <Button label='Save Slab to DB' onPress={sendDocToDb} />
        )}

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
  stockIdText: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: '600',
  },
  imageCountText: {
    fontSize: 16,
    marginVertical: 10,
  },
  loader: {
    marginVertical: 20,
  },
})
