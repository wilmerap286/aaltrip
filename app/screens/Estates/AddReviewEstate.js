import React, { useState, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { AirbnbRating, Button, Input } from "react-native-elements";
import { ScreenStackHeaderTitleView } from "react-native-screens";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";

import { firebaseApp } from "../../utils/FireBase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function AddReviewEstate(props) {
  const { navigation } = props;
  const { idEstate, setReviewsReload } = navigation.state.params;
  const [rating, setRating] = useState(null);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();

  const addReview = () => {
    if (rating === null) {
      toastRef.current.show("No has registrado puntuacion");
    } else if (!title) {
      toastRef.current.show("Debe registrar el titulo");
    } else if (!review) {
      toastRef.current.show("El comentario es obligatorio");
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser;
      const payload = {
        idUser: user.uid,
        avatarUser: user.photoURL,
        idEstate: idEstate,
        title: title,
        review: review,
        rating: rating,
        createdAt: new Date()
      };

      db.collection("reviews")
        .add(payload)
        .then(() => {
          updateEstate();
        })
        .catch(error => {
          setIsLoading(false);
          toastRef.current.show(
            "Error al registrar la opinion... intentelo mas tarde",
            2000
          );
        });
    }
  };

  const updateEstate = () => {
    const estateRef = db.collection("estates").doc(idEstate);

    estateRef.get().then(response => {
      const estateData = response.data();
      const ratingTotal = estateData.ratingTotal + rating;
      const quantityVoting = estateData.quantityVoting + 1;
      const ratingResult = ratingTotal / quantityVoting;
      estateRef
        .update({ rating: ratingResult, ratingTotal, quantityVoting })
        .then(() => {
          setIsLoading(false);
          setReviewsReload(true);
          navigation.goBack();
        });
    });
  };

  return (
    <View style={styles.viewBody}>
      <View style={styles.viewRating}>
        <AirbnbRating
          count={5}
          reviews={["Pesimo", "Deficiente", "Normal", "Muy Bueno", "Excelente"]}
          defaultRating={0}
          size={35}
          onFinishRating={value => setRating(value)}
        />
      </View>
      <View style={styles.formReview}>
        <Input
          placeholder="Titulo"
          containerStyle={styles.input}
          onChange={e => setTitle(e.nativeEvent.text)}
        />
        <Input
          placeholder="Comentario"
          multiline={true}
          inputContainerStyle={styles.textArea}
          onChange={e => setReview(e.nativeEvent.text)}
        />
        <Button
          title="Registrar Opinion"
          onPress={addReview}
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
        />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.5} />
      <Loading isVisible={isLoading} text="Enviando Opinion" />
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  viewRating: {
    height: 110,
    backgroundColor: "white"
  },
  formReview: {
    flex: 1,
    alignItems: "center",
    margin: 10,
    marginTop: 40
  },
  input: {
    marginBottom: 10
  },
  textArea: {
    height: 150,
    width: "100%",
    padding: 0,
    margin: 0
  },
  btnContainer: {
    flex: 1,
    //justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 10,
    width: "95%"
  },
  btn: {
    backgroundColor: "#00a680"
  }
});
