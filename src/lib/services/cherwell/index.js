const name = 'cherwell'

const { _request, request, urlencode, colors } = require('../.helper'),
CONFIG = require('../.helper').CONF.cherwell

options = request.OPTS
options.setURL( CONFIG.baseurl )

const handler = require('./handler')

module.exports = async function() {
   console.log(`[lib/services/cherwell.init] starting service`.yellow)
      let result = await requestToken()
      if( result ) {
         console.log(`[lib/services/cherwell.init] ${name} service initialized`.green)
         return { name, handler }
      } else {
         console.log(`[lib/services/cherwell.init] there was an error starting ${name}\n`.red)
         return null
      }
   }

function refreshToken() {
   return new Promise( (resolve, reject) => {
      //creat the object for the request
      options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Content-Type': 'x-www-form-urlencoded',
         'Authorization': `Bearer ${CONFIG.token.access}`
      } )

      let form = {
         grant_type: 'refresh_token',
         client_id: CONFIG.client_id,
         refresh_token: CONFIG.token.refresh
      }

      const post = request( options.url, options.headers, 'POST', 'json', 200)
      
      //make the request
      console.log('backend/cherwell/index.js[refreshToken]: requesting token refresh...')
      post('/token', urlencode( form )).then( ( res ) => {
         //get the tokens and the expire time
         CONFIG.token.access = res.access_token,
         CONFIG.token.refresh = res.refresh_token,
         CONFIG.token.expires_in = new Date().getTime() + (res.expires_in * 1000)
         //start token refresh timer
         resolve( CONFIG.token.expires_in )
      }).catch( (err) => {
         reject(err)
      })
   })
}

function tokenRefreshTimer(expiry) {
   let time = expiry - new Date().getTime()
   setTimeout( () => {
      refreshToken().then( expires_in => {
         console.log("[lib/services/cherwell] token refreshed! starting refresh timer (again)...")
         tokenRefreshTimer( expires_in )
      }).catch( e => {
         console.log(e)
      })
   }, time )
}

/**
 * 
 * sends a request to Cherwell for an access token
 * runs asynchronously, returning a Promise. if rejected, throws an error.
 * 
 */
async function requestToken() {
   return new Promise( (resolve, reject) => {
      //set the api-key and the Content-Type for this request
      options.setHeaders( {
         'api-key': CONFIG.client_id,
         'Content-Type': 'x-www-form-urlencoded'
      } )
      //make the form for the request
      let form = {
         grant_type: 'password',
         client_id: CONFIG.client_id,
         username: CONFIG.user,
         password: CONFIG.password,
      }
      //create a post function
      const post = request( options.url, options.headers, 'POST', 'json', 200)
      //fire the request
      post('/token', urlencode( form )).then( ( res ) => {
         //get the tokens and the expire time
         CONFIG.token = {
            access: res.access_token,
            refresh: res.refresh_token,
            expires_in: new Date().getTime() + (res.expires_in * 1000)
         }

         //start token refresh timer
         console.log("[lib/services/cherwell.init] token received. starting refresh timer...")
         tokenRefreshTimer( CONFIG.token.expires_in )
         resolve( true ) 
      }).catch( (err) => {
         console.log(err)
         resolve( false )
      })
   });
}                             