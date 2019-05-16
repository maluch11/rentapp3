const rules = {
    admin: {
      static: [
          "EnergyPrices:visit", 
          "Home:visit",
          "ReadsList:visit",
          "Read:visit",
          "Read:edit"
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
    },
    tenant: {
        static: [
        "EnergyPrices:visit",
        "ReadsList:visit",
        "Read:visit",
        "Home:visit"]
    }
  };
  
  export default rules;