import ldap from 'ldapjs';

const LDAP_OPTIONS = {
  server: {
    url: "ldap://192.168.10.10:389",
    bindDN: "CN=Administrator,CN=Users,DC=soclab,DC=local",
    bindCredentials: "User123!",
    searchBase: "DC=soclab,DC=local",
    searchFilter: "(sAMAccountName={{username}})",
    searchAttributes: ["cn", "mail", "sAMAccountName"]
  }
};
// 
async function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: LDAP_OPTIONS.server.url
    });

    // LDAP server'a bağlan
    client.bind(LDAP_OPTIONS.server.bindDN, LDAP_OPTIONS.server.bindCredentials, (bindErr) => {
      if (bindErr) {
        client.destroy();
        return reject(new Error(`LDAP bind error: ${bindErr.message}`));
      }

      // Arama filtresini oluştur
      const searchFilter = LDAP_OPTIONS.server.searchFilter.replace('{{username}}', username);
      
      // Kullanıcıyı ara
      const searchOptions = {
        scope: 'sub',
        filter: searchFilter,
        attributes: LDAP_OPTIONS.server.searchAttributes
      };

      client.search(LDAP_OPTIONS.server.searchBase, searchOptions, (searchErr, res) => {
        if (searchErr) {
          client.destroy();
          return reject(new Error(`LDAP search error: ${searchErr.message}`));
        }

        let userFound = false;
        let userObject = null;

        res.on('searchEntry', (entry) => {
          userFound = true;
          userObject = entry.object;
        });

        res.on('error', (err) => {
          client.destroy();
          reject(new Error(`LDAP search error: ${err.message}`));
        });

        res.on('end', (result) => {
          client.unbind((unbindErr) => {
            if (unbindErr) {
              console.error('LDAP unbind error:', unbindErr.message);
            }
            client.destroy();
          });

          if (!userFound) {
            return resolve(null); // Kullanıcı bulunamadı
          }
          
          resolve(userObject);
        });
      });
    });
  });
}

// Kullanım örneği
async function main() {
  try {
    const username = "sysadmin"; // Aradığınız kullanıcı adı
    const user = await findUserByUsername(username);
    
    if (user) {
      console.log("Kullanıcı bulundu:", user);
    } else {
      console.log("Kullanıcı bulunamadı");
    }
  } catch (error) {
    console.error("Hata:", error.message);
  }
}

// Fonksiyonu dışa aktar
// module.exports = { findUserByUsername };