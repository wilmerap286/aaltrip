import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { Card, Image, Icon, Rating } from "react-native-elements";
import * as firebase from "firebase";

export default function ListTopEstates(props) {
  const { estates, navigation, toastRef } = props;
  const [reloadEstates, setReloadEstates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <View>
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
          <Text>Cargando EL TOP 5 DE PROPIEDADES</Text>
        </View>
      )}
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
  const { id, name, description, images, rating } = estate.item;
  const [imageEstate, setImageEstate] = useState("");
  const [iconColor, setIconColor] = useState("#000");

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

  useEffect(() => {
    if (estate.index === 0) {
      setIconColor("#efb819");
    } else if (estate.index === 1) {
      setIconColor("#e3e4e5");
    } else if (estate.index === 2) {
      setIconColor("#cd7f32");
    }
  });

  return (
    <View style={styles.viewEstate}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Estate", { estate: estate.item })}
      >
        <Card containerStyle={styles.containerCard}>
          <Icon
            type="material-community"
            name="chess-queen"
            color={iconColor}
            size={40}
            containerStyle={styles.containerIcon}
          />
          <Image
            resizeMode="cover"
            source={{ uri: imageEstate }}
            style={styles.imageEstate}
            PlaceholderContent={<ActivityIndicator color="#fff" />}
          />
          <View style={styles.titleRanking}>
            <Text style={styles.estateName}>{name}</Text>
            <Rating
              style={styles.rating}
              imageSize={20}
              readonly
              startingValue={parseFloat(rating)}
            />
          </View>
          <Text style={styles.estateDescription}>{description}</Text>
        </Card>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  containerCard: {
    marginBottom: 30,
    borderWidth: 0
  },
  containerIcon: {
    position: "absolute",
    top: -30,
    left: -30,
    zIndex: 1
  },
  imageEstate: {
    width: "100%",
    height: 200
  },
  titleRanking: {
    flexDirection: "row",
    marginTop: 10
  },
  estateName: {
    fontWeight: "bold",
    fontSize: 20
  },
  rating: {
    position: "absolute",
    right: 0
  },
  estateDescription: {
    marginTop: 0,
    color: "grey",
    textAlign: "justify"
  },
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2"
  },
  viewEstate: {
    margin: 10
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
  }
});
