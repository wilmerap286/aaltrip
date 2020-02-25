import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert, Dimensions } from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import Modal from "../Modal";
import uuid from "uuid/v4";

import { firebaseApp } from "../../utils/FireBase";
import firebase from "firebase/app";
import "firebase/firestore";

const WidthScreen = Dimensions.get("window").width;

export default function AddEstateForm(props) {
  const { toastRef, setIsLoading, navigation, setIsReloadEstates } = props;
  const [imagesSelected, setImagesSelected] = useState([]);
  const [nameEstate, setNameEstate] = useState("");
  const [addressEstate, setAddressEstate] = useState("");
  const [describeEstate, setDescribeEstate] = useState("");
  const [isVisibleMap, setIsVisibleMap] = useState(false);
  const [locationEstate, setLocationEstate] = useState(null);

  const db = firebase.firestore(firebaseApp);

  const addPropiedad = () => {
    if (!nameEstate || !addressEstate || !describeEstate) {
      toastRef.current.show(
        "Todos los campos de la propiedad son obligatorios",
        2000
      );
    } else if (imagesSelected.length == 0) {
      toastRef.current.show("La propiedad debe tener minimo una foto", 2000);
    } else if (!locationEstate) {
      toastRef.current.show(
        "La propiedad debe estar localizada en el mapa",
        2000
      );
    } else {
      setIsLoading(true);
      //Se suben las imagenes
      uploadImageStorage(imagesSelected).then(arrayImages => {
        //Crear la propiedad
        db.collection("estates")
          .add({
            name: nameEstate,
            address: addressEstate,
            description: describeEstate,
            location: locationEstate,
            images: arrayImages,
            type: 0,
            contactName: "",
            phoneNumber: "",
            rating: 0,
            ratingTotal: 0,
            quantityVoting: 0,
            createdAt: new Date(),
            createdBy: firebase.auth().currentUser.uid
          })
          .then(() => {
            setIsLoading(false);
            setIsReloadEstates(true);
            navigation.navigate("Estates");
          })
          .catch(error => {
            setIsLoading(false);
            toastRef.current.show(
              "Error al crear la propiedad... intentelo mas tarde",
              2000
            );
          });
      });
    }
  };

  //Funcion para subir imagenes al storage de firebase
  const uploadImageStorage = async imageArray => {
    const imagesBlob = [];
    await Promise.all(
      imageArray.map(async image => {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = firebase
          .storage()
          .ref("estates-images")
          .child(uuid());
        await ref.put(blob).then(result => {
          imagesBlob.push(result.metadata.name);
        });
      })
    );
    return imagesBlob;
  };

  return (
    <ScrollView>
      <ImageEstate imageEstate={imagesSelected[0]} />
      <FormAdd
        setNameEstate={setNameEstate}
        setAddressEstate={setAddressEstate}
        setDescribeEstate={setDescribeEstate}
        setIsVisibleMap={setIsVisibleMap}
        locationEstate={locationEstate}
      />
      <UploadImage
        imagesSelected={imagesSelected}
        setImagesSelected={setImagesSelected}
        toastRef={toastRef}
      />
      <Button
        title="Crear Propiedad"
        onPress={addPropiedad}
        buttonStyle={styles.btnAddEstate}
      />

      <Map
        isVisibleMap={isVisibleMap}
        setIsVisibleMap={setIsVisibleMap}
        setLocationEstate={setLocationEstate}
        toastRef={toastRef}
      />
    </ScrollView>
  );
}

function ImageEstate(props) {
  const { imageEstate } = props;

  return (
    <View styles={styles.viewFoto}>
      {imageEstate ? (
        <Image
          source={{ uri: imageEstate }}
          style={{ width: WidthScreen, height: 200 }}
        />
      ) : (
        <Image
          source={require("../../../assets/img/no-image.png")}
          style={{ width: WidthScreen, height: 200 }}
        />
      )}
    </View>
  );
}

function UploadImage(props) {
  const { imagesSelected, setImagesSelected, toastRef } = props;

  const imageSelect = async () => {
    const resultPermissions = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );
    const resultPermissionCamera =
      resultPermissions.permissions.cameraRoll.status;

    if (resultPermissionCamera === "denied") {
      toastRef.current.show("Acceso a la galeria denegado", 2000);
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3]
      });

      if (result.cancelled) {
        //Cancela la galeria
        toastRef.current.show("Proceso cancelado", 2000);
      } else {
        //Se define un array para agregar las imaganes que se vayan seleccionando
        setImagesSelected([...imagesSelected, result.uri]);
      }
    }
  };

  const removeImage = image => {
    const arrayImages = imagesSelected;

    Alert.alert(
      "Eliminar Imagen",
      "¿Estás seguro de eliminar la imagen?",
      [
        {
          text: "Cencelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () =>
            setImagesSelected(
              arrayImages.filter(imageUrl => imageUrl !== image)
            )
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.viwImage}>
      {imagesSelected.length < 5 && (
        <Icon
          type="material-community"
          name="camera"
          color="#7a7a7a"
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
        />
      )}

      {imagesSelected.map((imageEstate, index) => (
        <Avatar
          key={index}
          onPress={() => removeImage(imageEstate)}
          style={styles.miniatureStyle}
          source={{ uri: imageEstate }}
        />
      ))}
    </View>
  );
}

function FormAdd(props) {
  const {
    setNameEstate,
    setAddressEstate,
    setDescribeEstate,
    setIsVisibleMap,
    locationEstate
  } = props;
  return (
    <View style={styles.viewForm}>
      <Input
        placeholder="Nombre de la Propiedad"
        containerStyle={styles.input}
        onChange={e => setNameEstate(e.nativeEvent.text)}
      />
      <Input
        placeholder="Direccion de la Propiedad"
        containerStyle={styles.input}
        rightIcon={{
          type: "material-community",
          name: "google-maps",
          color: locationEstate ? "#00a680" : "#c2c2c2",
          onPress: () => setIsVisibleMap(true)
        }}
        onChange={e => setAddressEstate(e.nativeEvent.text)}
      />
      <Input
        placeholder="Descripcion de la Propiedad"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={e => setDescribeEstate(e.nativeEvent.text)}
      />
    </View>
  );
}

function Map(props) {
  const { isVisibleMap, setIsVisibleMap, setLocationEstate, toastRef } = props;
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const resultPermissions = await Permissions.askAsync(
        Permissions.LOCATION
      );
      const statusPermissions = resultPermissions.permissions.location.status;

      if (statusPermissions !== "granted") {
        toastRef.current.show(
          "Debe aceptar los permisos de GEOLOCALIZACION",
          2000
        );
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
      }
    })();
  }, []);

  const confirmLocation = () => {
    setLocationEstate(location);
    toastRef.current.show("Localizacion Guardada", 2000);
    setIsVisibleMap(false);
  };

  return (
    <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
      <View>
        {location && (
          <MapView
            style={styles.mapStyle}
            initialRegion={location}
            showsUserLocation={true}
            onRegionChange={region => setLocation(region)}
          >
            <MapView.Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
              draggable
            />
          </MapView>
        )}
        <View style={styles.viewMapBtn}>
          <Button
            title="Guardar Ubicacion"
            onPress={confirmLocation}
            containerStyle={styles.viewMapBtnContainerSave}
            buttonStyle={styles.viewMapBtnSave}
          />
          <Button
            title="Cancelar Ubicacion"
            onPress={() => setIsVisibleMap(false)}
            containerStyle={styles.viewMapBtnContainerCancel}
            buttonStyle={styles.viewMapBtnCancel}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewFoto: {
    alignItems: "center",
    height: 200,
    marginBottom: 20
  },
  viwImage: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: "#e3e3e3"
  },
  miniatureStyle: {
    marginRight: 10,
    height: 70,
    width: 70
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15
  },
  input: {
    marginBottom: 10
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0
  },
  mapStyle: {
    width: "100%",
    height: 450
  },
  viewMapBtn: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10
  },
  viewMapBtnContainerSave: {
    paddingRight: 5
  },
  viewMapBtnSave: {
    backgroundColor: "#00a680"
  },
  viewMapBtnContainerCancel: {
    paddingLeft: 5
  },
  viewMapBtnCancel: {
    backgroundColor: "#a60d0d"
  },
  btnAddEstate: {
    backgroundColor: "#00a680",
    margin: 20
  }
});
