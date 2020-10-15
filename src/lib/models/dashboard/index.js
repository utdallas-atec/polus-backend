/**
 * Dashboard model
 * a dashboard contains information that is presented to a user. They have widgets, which hold that information, from available services.
 * customer info, originates there.
 * @module model/dashboard
 * @requires module:helper.glob
 * @requires module:helper.path
 * @requires module:helper.colors
 */

const { glob, path, colors } = require('../../../.helper'),
boards = {}

let _dashboard = ( boards ) => ({
   boards,

   get( name ) {
      if( this.boards[name] ) {
         return this.boards[name] 
      }
      
      return null
   }
})

/**
 * @function init
 * @summary intializes the dashboard model, gathering the available schemas
 * @return {closure} closure fuction holding the boards and getter
 */
module.exports = () =>  {
   console.log('\n[boot/lib/models] gathering dashboard schemas..'.yellow)
   let files = glob.sync('./src/lib/models/dashboard/schemas/**.js')
   while( files.length != 0 ) {
      let file = files.pop()
      let { name, schema } = require( path.resolve(file) )
      if( name && schema ) {
         boards[name] = schema
         console.log(`-->> ${name.green} schema loaded`)
      }
   }

   return _dashboard( boards )
}