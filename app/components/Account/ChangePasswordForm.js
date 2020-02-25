import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Input, Button } from "react-native-elements";
import { validateEmail } from "../../utils/Validation";
import * as firebase from "firebase";
import { reauthenticate } from "../../utils/Api";

export default function CahngeEmailForm(props) {
  const { setIsVisibleModal, setReloadData, toastRef } = props;
  const [hidePassword, setHidePassword] = useState(true);
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [hidePasswordRepeat, setHidePasswordRepeat] = useState(true);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(null);

  const updateNewPassword = async () => {
    setError({});
    if (
      !password ||
      !newPassword ||
      !passwordRepeat ||
      newPassword === password
    ) {
      let objError = {};
      !password && (objError.password = "No puede estar vacio");
      !newPassword && (objError.newPassword = "No puede estar vacio");
      !passwordRepeat && (objError.passwordRepeat = "No puede estar vacio");
      setError(objError);
    } else {
      if (newPassword !== passwordRepeat) {
        setError({
          newPassword: "Las nuevas contraseñas iguales",
          passwordRepeat: "Las nuevas contraseñas iguales"
        });
      } else {
        setIsLoading(true);
        reauthenticate(password)
          .then(() => {
            firebase
              .auth()
              .currentUser.updatePassword(newPassword)
              .then(() => {
                setIsLoading(false);
                toastRef.current.show("Password actualizado correcatmente");
                setIsVisibleModal(false);
                firebase.auth().signOut();
              })
              .catch(() => {
                setError({ general: "Error al actualizar el password" });
                setIsLoading(false);
              });
          })
          .catch(() => {
            setError({ password: "Contraseña Incorrecta" });
            setIsLoading(false);
          });
      }
    }
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder="Password Anterior"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={hidePassword}
        onChange={e => setPassword(e.nativeEvent.text)}
        rightIcon={{
          type: "material-community",
          name: hidePassword ? "eye-outline" : "eye-off-outline",
          iconStyle: styles.iconRigth,
          onPress: () => setHidePassword(!hidePassword)
        }}
        errorMessage={error.password}
      />
      <Input
        placeholder="Nuevo Password"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={hideNewPassword}
        onChange={e => setNewPassword(e.nativeEvent.text)}
        rightIcon={{
          type: "material-community",
          name: hideNewPassword ? "eye-outline" : "eye-off-outline",
          iconStyle: styles.iconRigth,
          onPress: () => setHideNewPassword(!hideNewPassword)
        }}
        errorMessage={error.newPassword}
      />
      <Input
        placeholder="Repetir Password"
        password={true}
        secureTextEntry={hidePasswordRepeat}
        containerStyle={styles.input}
        onChange={e => setPasswordRepeat(e.nativeEvent.text)}
        rightIcon={{
          type: "material-community",
          name: hidePasswordRepeat ? "eye-outline" : "eye-off-outline",
          iconStyle: styles.iconRigth,
          onPress: () => setHidePasswordRepeat(!hidePasswordRepeat)
        }}
        errorMessage={error.passwordRepeat}
      />
      <Button
        title="Actualizar Password"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btnUpdate}
        onPress={updateNewPassword}
        loading={isLoading}
      />
      <Text>{error.general}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10
  },
  input: {
    width: "100%",
    marginTop: 20
  },
  btnContainer: {
    marginTop: 20,
    width: "95%"
  },
  btnUpdate: {
    backgroundColor: "#00a680"
  },
  iconRigth: {
    color: "#c2c2c2"
  }
});
