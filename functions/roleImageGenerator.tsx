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

const mafiaFrontEn = require("../assets/mafia.webp");
const mafiaFrontKa = require("../assets/mafia-ka-front.webp");
const mafiaFrontRu = require("../assets/mafia-ru-front.webp");
const citizenFrontEn = require("../assets/citizen.webp");
const citizenFrontKa = require("../assets/citizen-ka-front.webp");
const citizenFrontRu = require("../assets/citizen-ru-front.webp");
const doctorFrontEn = require("../assets/doctor.webp");
const doctorFrontKa = require("../assets/doctor-ka-front.webp");
const doctorFrontRu = require("../assets/doctor-ru-front.webp");
const sherifFrontEn = require("../assets/sherif.webp");
const sherifFrontKa = require("../assets/sherif-ka-front.webp");
const sherifFrontRu = require("../assets/sherif-ru-front.webp");
const killerFrontEn = require("../assets/killer.webp");
const killerFrontKa = require("../assets/killer-ka-front.webp");
const killerFrontRu = require("../assets/killer-ru-front.webp");
const donFrontEn = require("../assets/don.webp");
const donFrontKa = require("../assets/don-ka-front.webp");
const donFrontRu = require("../assets/don-ru-front.webp");

const roleImageGenerator = ({ language, role }: any) => {
  let roleImage;
  if (language === "GE") {
    if (role?.value === "mafia") {
      roleImage = { back: mafiaKa, front: mafiaFrontKa };
    } else if (role?.value === "citizen") {
      roleImage = { back: citizenKa, front: citizenFrontKa };
    } else if (role?.value === "doctor") {
      roleImage = { back: doctorKa, front: doctorFrontKa };
    } else if (role?.value === "police") {
      roleImage = { back: sherifKa, front: sherifFrontKa };
    } else if (role?.value === "serial-killer") {
      roleImage = { back: killerKa, front: killerFrontKa };
    } else {
      roleImage = { back: donKa, front: donFrontKa };
    }
  } else if (language === "RU") {
    if (role?.value === "mafia") {
      roleImage = { back: mafiaRu, front: mafiaFrontRu };
    } else if (role?.value === "citizen") {
      roleImage = { back: citizenRu, front: citizenFrontRu };
    } else if (role?.value === "doctor") {
      roleImage = { back: doctorRu, front: doctorFrontRu };
    } else if (role?.value === "police") {
      roleImage = { back: sherifRu, front: sherifFrontRu };
    } else if (role?.value === "serial-killer") {
      roleImage = { back: killerRu, front: killerFrontRu };
    } else {
      roleImage = { back: donRu, front: donFrontRu };
    }
  } else {
    if (role?.value === "mafia") {
      roleImage = { back: mafiaEn, front: mafiaFrontEn };
    } else if (role?.value === "citizen") {
      roleImage = { back: citizenEn, front: citizenFrontEn };
    } else if (role?.value === "doctor") {
      roleImage = { back: doctorEn, front: doctorFrontEn };
    } else if (role?.value === "police") {
      roleImage = { back: sherifEn, front: sherifFrontEn };
    } else if (role?.value === "serial-killer") {
      roleImage = { back: killerEn, front: killerFrontEn };
    } else {
      roleImage = { back: donEn, front: donFrontEn };
    }
  }
  return roleImage;
};

export default roleImageGenerator;

const styles = StyleSheet.create({});
