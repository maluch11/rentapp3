const rules = {
    admin: {
      static: [

          "Home:visit",
          "ReadsList:visit",
          "Read:visit",
          "Read:edit",

          "Rent:visit",
          "Rent:edit",
          "RentsList:visit",

          "EnergyPricesList:visit", 
          "EnergyPrice:edit",
          "WaterPricesList:visit",
          "WaterPrice:edit",

          "Context:edit",

        ]
    },

    tenant: {
        static: [
        "Home:visit",
        "ReadsList:visit",
        "Read:visit",
        "RentsList:visit",
        "Rent:visit",
      ]
    },

    manager: {
      static: [
        "posts:list",
        "posts:create",
        "users:getSelf",
        "home-page:visit",
        "dashboard-page:visit"
      ],
      dynamic: {
        "posts:edit": ({userId, postOwnerId}) => {
          if (!userId || !postOwnerId) return false;
          return userId === postOwnerId;
        }
      }
    }
  };
  
  export default rules;