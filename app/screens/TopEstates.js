import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-easy-toast";
import { NavigationEvents } from "react-navigation";
import ListTopEstates from "../components/Ranking/ListTopEstates";

//Se importa firebase para uso de los datos
import { firebaseApp } from "../utils/FireBase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function TopEstates(props) {
  const { navigation } = props;
  const [estates, setEstates] = useState([]);
  const [reloadEstates, setReloadEstates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();

  useEffect(() => {
    (async => {
      db.collection("estates")
        .orderBy("rating", "desc")
        .limit(5)
        .get()
        .then(response => {
          const estatesArray = [];
          response.forEach(doc => {
            let estate = doc.data();
            estate.id = doc.id;
            estatesArray.push(estate);
          });
          setEstates(estatesArray);
        })
        .catch(() => {
          toastRef.current.show(
            "Error al agregar a favoritos... intentelo mas tarde",
            2000
          );
        });
    })();

    setReloadEstates(false);
  }, [reloadEstates]);

  return (
    <View>
      <ListTopEstates
        estates={estates}
        navigation={navigation}
        toastRef={toastRef}
      />
      <Toast ref={toastRef} position="center" opacity={0.5} />
    </View>
  );
}
