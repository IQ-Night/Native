/**
 * Define user level
 */
export const DefineUserLevel = ({ user }: any) => {
  let level: any;
  if (user?.totalGames >= 0 && user?.totalGames < 51) {
    level = {
      current: 1,
      percent: Math.min((user?.totalGames / 50) * 100, 100),
      max: 50,
    };
  } else if (user?.totalGames > 50 && user?.totalGames < 101) {
    level = {
      current: 2,
      percent: Math.min((user?.totalGames / 100) * 100, 100),
      max: 100,
    };
  } else if (user?.totalGames > 100 && user?.totalGames < 201) {
    level = {
      current: 3,
      percent: Math.min((user?.totalGames / 200) * 100, 100),
      max: 200,
    };
  } else if (user?.totalGames > 200 && user?.totalGames < 401) {
    level = {
      current: 4,
      percent: Math.min((user?.totalGames / 400) * 100, 100),
      max: 400,
    };
  } else if (user?.totalGames > 400 && user?.totalGames < 601) {
    level = {
      current: 5,
      percent: Math.min((user?.totalGames / 600) * 100, 100),
      max: 600,
    };
  } else if (user?.totalGames > 600 && user?.totalGames < 801) {
    level = {
      current: 6,
      percent: Math.min((user?.totalGames / 800) * 100, 100),
      max: 800,
    };
  } else if (user?.totalGames > 800 && user?.totalGames < 1001) {
    level = {
      current: 7,
      percent: Math.min((user?.totalGames / 1000) * 100, 100),
      max: 1000,
    };
  } else if (user?.totalGames > 1000 && user?.totalGames < 1501) {
    level = {
      current: 8,
      percent: Math.min((user?.totalGames / 1500) * 100, 100),
      max: 1500,
    };
  } else if (user?.totalGames > 1500 && user?.totalGames < 2001) {
    level = {
      current: 9,
      percent: Math.min((user?.totalGames / 2000) * 100, 100),
      max: 2000,
    };
  } else if (user?.totalGames > 2000 && user?.totalGames < 2501) {
    level = {
      current: 10,
      percent: Math.min((user?.totalGames / 2500) * 100, 100),
      max: 2500,
    };
  } else if (user?.totalGames > 2500 && user?.totalGames < 3501) {
    level = {
      current: 11,
      percent: Math.min((user?.totalGames / 3500) * 100, 100),
      max: 3500,
    };
  } else if (user?.totalGames > 3500 && user?.totalGames < 5001) {
    level = {
      current: 12,
      percent: Math.min((user?.totalGames / 5000) * 100, 100),
      max: 5000,
    };
  } else if (user?.totalGames > 5000 && user?.totalGames < 6001) {
    level = {
      current: 13,
      percent: Math.min((user?.totalGames / 6000) * 100, 100),
      max: 6000,
    };
  } else if (user?.totalGames > 6000 && user?.totalGames < 8001) {
    level = {
      current: 14,
      percent: Math.min((user?.totalGames / 8000) * 100, 100),
      max: 8000,
    };
  } else if (user?.totalGames > 8000 && user?.totalGames < 10001) {
    level = {
      current: 15,
      percent: Math.min((user?.totalGames / 10000) * 100, 100),
      max: 10000,
    };
  }

  return level;
};
