import { StyleSheet, Text, View } from "react-native";
import React from "react";

const citizenKa = require("../assets/citizen-ka.webp");
const mafiaKa = require("../assets/mafia-ka.webp");
const donKa = require("../assets/don-ka.webp");
const doctorKa = require("../assets/doctor-ka.webp");
const sherifKa = require("../assets/sherif-ka.webp");
const killerKa = require("../assets/killer-ka.webp");
const citizenRu = require("../assets/citizen-ru.webp");
const mafiaRu = require("../assets/mafia-ru.webp");
const donRu = require("../assets/don-ru.webp");
const doctorRu = require("../assets/doctor-ru.webp");
const sherifRu = require("../assets/sherif-ru.webp");
const killerRu = require("../assets/killer-ru.webp");
const citizenEn = require("../assets/citizen-ru.webp");
const mafiaEn = require("../assets/mafia-ru.webp");
const donEn = require("../assets/don-ru.webp");
const doctorEn = require("../assets/doctor-ru.webp");
const sherifEn = require("../assets/sherif-ru.webp");
const killerEn = require("../assets/killer-ru.webp");

const roleImageGenerator = ({ language, role }: any) => {
  let roleImage;
  if (language === "GE") {
    if (role === "mafia") {
      roleImage = mafiaKa;
    } else if (role === "citizen") {
      roleImage = citizenKa;
    } else if (role === "doctor") {
      roleImage = doctorKa;
    } else if (role === "police") {
      roleImage = sherifKa;
    } else if (role === "serial-killer") {
      roleImage = killerKa;
    } else {
      roleImage = donKa;
    }
  } else if (language === "RU") {
    if (role === "mafia") {
      roleImage = mafiaRu;
    } else if (role === "citizen") {
      roleImage = citizenRu;
    } else if (role === "doctor") {
      roleImage = doctorRu;
    } else if (role === "police") {
      roleImage = sherifRu;
    } else if (role === "serial-killer") {
      roleImage = killerRu;
    } else {
      roleImage = donRu;
    }
  } else {
    if (role === "mafia") {
      roleImage = mafiaEn;
    } else if (role === "citizen") {
      roleImage = citizenEn;
    } else if (role === "doctor") {
      roleImage = doctorEn;
    } else if (role === "police") {
      roleImage = sherifEn;
    } else if (role === "serial-killer") {
      roleImage = killerEn;
    } else {
      roleImage = donEn;
    }
  }
  return roleImage;
};

export default roleImageGenerator;

const styles = StyleSheet.create({});
