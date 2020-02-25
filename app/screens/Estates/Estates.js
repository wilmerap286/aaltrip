import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import ActionButton from "react-native-action-button";
import ListEstates from "../../components/Estates/ListEstates";

//Se importa firebase para uso de los datos
import { firebaseApp } from "../../utils/FireBase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function Estates(props) {
  const { navigation } = props;
  const [user, setUser] = useState(null);
  const [estates, setEstates] = useState([]);
  const [startEstates, setStartEstates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalEstates, setTotalEstates] = useState(0);
  const [isReloadEstates, setIsReloadEstates] = useState(false);
  const limitEstates = 8;

  //Se valida la sesion de usuarios
  useEffect(() => {
    firebase.auth().onAuthStateChanged(userInfo => {
      setUser(userInfo);
    });
  }, []);

  useEffect(() => {
    //Se obtiene el total de las propiedades
    db.collection("estates")
      .get()
      .then(snap => {
        setTotalEstates(snap.size);
      });

    //Se crea una funcion anonima async
    (async () => {
      const resultEstates = [];

      const estates = db
        .collection("estates")
        .orderBy("createdAt", "desc")
        .limit(limitEstates);

      await estates.get().then(response => {
        setStartEstates(response.docs[response.docs.length - 1]);

        response.forEach(doc => {
          let estate = doc.data();
          estate.id = doc.id;
          resultEstates.push({ estate });
        });
        setEstates(resultEstates);
      });
    })();
    setIsReloadEstates(false);
  }, [isReloadEstates]);

  const handledLoadMore = async () => {
    const resultEstates = [];
    estates.length < totalEstates && setIsLoading(true);

    const estatesDb = db
      .collection("estates")
      .orderBy("createdAt", "desc")
      .startAfter(startEstates.data().createdAt)
      .limit(limitEstates);

    await estatesDb.get().then(response => {
      if (response.docs.length > 0) {
        setStartEstates(response.docs[response.docs.length - 1]);
      } else {
        setIsLoading(false);
      }

      response.forEach(doc => {
        let estate = doc.data();
        estate.id = doc.id;
        resultEstates.push({ estate });
      });

      setEstates([...estates, ...resultEstates]);
    });
  };

  return (
    <View style={styles.viewBody}>
      <ListEstates
        estates={estates}
        isLoading={isLoading}
        handledLoadMore={handledLoadMore}
        navigation={navigation}
      />

      {user && (
        <AddEstateBotton
          navigation={navigation}
          setIsReloadEstates={setIsReloadEstates}
        />
      )}
    </View>
  );
}

function AddEstateBotton(props) {
  const { navigation, setIsReloadEstates } = props;
  return (
    <ActionButton
      buttonColor="#00a680"
      onPress={() => navigation.navigate("AddEstate", { setIsReloadEstates })}
    />
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  }
});
