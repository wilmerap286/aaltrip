import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, ScrollView, View, Text, Dimensions } from "react-native";
import { Rating, ListItem, Icon } from "react-native-elements";
import Carousel from "../../components/Carousel";
import Map from "../../components/Map";
import ListReviews from "../../components/Estates/ListReview";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";

//Se importa firebase para uso de los datos
import { firebaseApp } from "../../utils/FireBase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

const screenWidth = Dimensions.get("window").width;

export default function Estate(props) {
  const { navigation } = props;
  const { estate } = navigation.state.params;
  const [imagesEstate, setImagesEstate] = useState([]);
  const [rating, setRating] = useState(estate.rating);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textLoading, setTextLoading] = useState("");
  const [userLogged, setUserLogged] = useState(false);
  const toastRef = useRef();

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useEffect(() => {
    const arrayUrls = [];

    (async () => {
      await Promise.all(
        estate.images.map(async idImage => {
          await firebase
            .storage()
            .ref(`estates-images/${idImage}`)
            .getDownloadURL()
            .then(imageUrl => {
              arrayUrls.push(imageUrl);
            });
        })
      );
      setImagesEstate(arrayUrls);
    })();
  }, []);

  useEffect(() => {
    if (userLogged) {
      db.collection("favorites")
        .where("idEstate", "==", estate.id)
        .where("idUser", "==", firebase.auth().currentUser.uid)
        .get()
        .then(response => {
          if (response.docs.length == 1) {
            setIsFavorite(true);
          }
        });
    }
  }, []);

  const addFavorite = () => {
    if (userLogged) {
      setTextLoading("Agregando a Favoritos");
      setIsLoading(true);
      const payload = {
        idUser: firebase.auth().currentUser.uid,
        idEstate: estate.id
      };

      db.collection("favorites")
        .add(payload)
        .then(() => {
          setIsFavorite(true);
          setIsLoading(false);
          toastRef.current.show("Registro agregado correctamente", 2000);
        })
        .catch(error => {
          setIsLoading(false);
          toastRef.current.show(
            "Error al agregar a favoritos... intentelo mas tarde",
            2000
          );
        });
    } else {
      toastRef.current.show(
        "Debes estar logueado para añadir favoritos... intentelo mas tarde",
        2000
      );
    }
  };

  const removeFavorite = () => {
    setTextLoading("Eliminando de Favoritos");
    setIsLoading(true);
    db.collection("favorites")
      .where("idEstate", "==", estate.id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then(response => {
        response.forEach(doc => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsFavorite(false);
              setIsLoading(false);
              toastRef.current.show("Registro eliminado correctamente", 2000);
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
  };

  return (
    <ScrollView style={StyleSheet.viewBody}>
      <View style={styles.viewFavorite}>
        <Icon
          type="material-community"
          name={isFavorite ? "heart" : "heart-outline"}
          onPress={isFavorite ? removeFavorite : addFavorite}
          color={isFavorite ? "#00a680" : "#000"}
          size={35}
          underlayColor="transparent"
        />
      </View>
      <Carousel arrayImages={imagesEstate} width={screenWidth} height={200} />
      <TitleEstate
        name={estate.name}
        description={estate.description}
        rating={rating}
      />
      <EstateInfo
        location={estate.location}
        name={estate.name}
        address={estate.address}
      />
      <ListReviews
        navigation={navigation}
        idEstate={estate.id}
        setRating={setRating}
      />
      <Toast ref={toastRef} position="center" opacity={0.5} />
      <Loading isVisible={isLoading} text={textLoading} />
    </ScrollView>
  );
}

function TitleEstate(props) {
  const { name, description, rating } = props;

  return (
    <View style={styles.ViewEstateTitle}>
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.nameEstate}>{name}</Text>
        <Rating
          style={styles.rating}
          imageSize={20}
          readonly
          startingValue={parseFloat(rating)}
        />
      </View>
      <Text style={styles.descriptionEstate}>{description}</Text>
    </View>
  );
}

function EstateInfo(props) {
  const { location, name, address } = props;
  const listInfo = [
    {
      text: address,
      iconName: "map-marker",
      iconType: "material-community",
      action: null
    },
    {
      text: "555-009-8989",
      iconName: "phone",
      iconType: "material-community",
      action: null
    },
    {
      text: "prueba@ahivamos.com",
      iconName: "at",
      iconType: "material-community",
      action: null
    }
  ];

  return (
    <View style={styles.viewEstateInfo}>
      <Text style={styles.estateInfoTitle}>Informacion de la Propiedad</Text>
      <Map location={location} name={name} height={100} />
      {listInfo.map((item, index) => (
        <ListItem
          key={index}
          title={item.text}
          leftIcon={{
            name: item.iconName,
            type: item.iconType,
            color: "#00a680"
          }}
          containerStyle={styles.continerListItem}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "transparent"
  },
  viewFavorite: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 100,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 5
  },
  ViewEstateTitle: {
    margin: 15
  },
  nameEstate: {
    fontSize: 20,
    fontWeight: "bold"
  },
  rating: {
    position: "absolute",
    right: 0
  },
  descriptionEstate: {
    marginTop: 5,
    color: "grey"
  },
  viewEstateInfo: {
    margin: 15,
    marginTop: 25
  },
  estateInfoTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10
  },
  continerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1
  }
});
