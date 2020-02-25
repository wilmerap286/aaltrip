import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import Loading from "../components/Loading";
import Toast from "react-native-easy-toast";
import { NavigationEvents } from "react-navigation";

//Se importa firebase para uso de los datos
import { firebaseApp } from "../utils/FireBase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function Favorites(props) {
  const { navigation } = props;
  const [estates, setEstates] = useState([]);
  const [reloadEstates, setReloadEstates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLogged, setUserLogged] = useState(false);
  const toastRef = useRef();

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useEffect(() => {
    if (userLogged) {
      const idUser = firebase.auth().currentUser.uid;
      db.collection("favorites")
        .where("idUser", "==", idUser)
        .get()
        .then(response => {
          const idEstatesArray = [];
          response.forEach(doc => {
            idEstatesArray.push(doc.data().idEstate);
          });

          getDataEstate(idEstatesArray).then(response => {
            const estates = [];
            response.forEach(doc => {
              let estate = doc.data();
              estate.id = doc.id;
              estates.push(estate);
            });
            setEstates(estates);
          });
        });
    }
    setReloadEstates(false);
  }, [reloadEstates]);

  const getDataEstate = idEstatesArray => {
    const arrayEstates = [];
    idEstatesArray.forEach(idEstate => {
      const result = db
        .collection("estates")
        .doc(idEstate)
        .get();
      arrayEstates.push(result);
    });
    return Promise.all(arrayEstates);
  };

  if (!userLogged) {
    return (
      <NotLoggedUser
        setReloadEstates={setReloadEstates}
        navigation={navigation}
      />
    );
  }
  if (estates.length === 0)
    return <NotFoundEstates setReloadEstates={setReloadEstates} />;

  return (
    <View style={styles.viewBody}>
      <NavigationEvents onWillFocus={() => setReloadEstates(true)} />
      {estates ? (
        <FlatList
          data={estates}
          renderItem={estate => (
            <Estate
              estate={estate}
              navigation={navigation}
              setReloadEstates={setReloadEstates}
              setIsLoading={setIsLoading}
              toastRef={toastRef}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderEstate}>
          <ActivityIndicator size="large" />
          <Text>Cargando propiedades FAVORITAS</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.5} />
      <Loading isVisible={isLoading} text="Eliminando Registro" />
    </View>
  );
}

function Estate(props) {
  const {
    estate,
    navigation,
    setReloadEstates,
    setIsLoading,
    toastRef
  } = props;
  const { id, name, images } = estate.item;
  const [imageEstate, setImageEstate] = useState("");

  useEffect(() => {
    const image = images[0];
    firebase
      .storage()
      .ref(`estates-images/${image}`)
      .getDownloadURL()
      .then(result => {
        setImageEstate(result);
      });
  });

  const removeFavorite = () => {
    Alert.alert(
      "Eliminar Favorito",
      "¿Estás seguro de eliminar la propiedad?",
      [
        {
          text: "Cencelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () => {
            setIsLoading(true);
            db.collection("favorites")
              .where("idEstate", "==", id)
              .where("idUser", "==", firebase.auth().currentUser.uid)
              .get()
              .then(response => {
                response.forEach(doc => {
                  const idFavorite = doc.id;
                  db.collection("favorites")
                    .doc(idFavorite)
                    .delete()
                    .then(() => {
                      setIsLoading(false);
                      setReloadEstates(true);
                      toastRef.current.show(
                        "Registro eliminado correctamente",
                        2000
                      );
                    })
                    .catch(() => {
                      setIsLoading(false);
                      toastRef.current.show(
                        "Error al agregar a favoritos... intentelo mas tarde",
                        2000
                      );
                    });
                });
              });
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.viewEstate}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Estate", { estate: estate.item })}
      >
        <Image
          resizeMode="cover"
          source={{ uri: imageEstate }}
          style={styles.imageEstate}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
        />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.estateName}>{name}</Text>
        <Icon
          type="material-community"
          name="heart"
          color="#00a680"
          containerStyle={styles.favorite}
          onPress={removeFavorite}
          size={40}
          underlayColor="#fff"
        />
      </View>
    </View>
  );
}

function NotFoundEstates(props) {
  const { setReloadEstates } = props;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <NavigationEvents onWillFocus={() => setReloadEstates(true)} />
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold " }}>
        No tienes propiedades favoritas
      </Text>
    </View>
  );
}

function NotLoggedUser(props) {
  const { setReloadEstates, navigation } = props;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <NavigationEvents onWillFocus={() => setReloadEstates(true)} />
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        Debes estar logueado para ver esta sección
      </Text>
      <Button
        title="Ir al LOGIN"
        onPress={() => navigation.navigate("Login")}
        containerStyle={{ marginTop: 20, width: "80%" }}
        buttonStyle={{ backgroundColor: "#00a680" }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2"
  },
  viewEstate: {
    margin: 10
  },
  imageEstate: {
    width: "100%",
    height: 180
  },
  info: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: "#fff"
  },
  estateName: {
    fontWeight: "bold",
    fontSize: 20
  },
  estateAddress: {
    paddingTop: 2,
    color: "grey"
  },
  estateDescription: {
    paddingTop: 2,
    color: "grey",
    width: 300
  },
  favorite: {
    marginTop: -35,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100
  },
  loaderEstate: {
    marginTop: 10,
    marginBottom: 10
  }
});
