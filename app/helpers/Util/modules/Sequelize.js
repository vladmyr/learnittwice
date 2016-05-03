'use strict';

/**
 * Sequelize utility functionality
 * @module
 */
class Sequelize {
  /**
   * Handle transaction commit
   * @param t                  - transaction
   * @param {boolean} [isSilent] - defines whether to throw exception on error
   */
  static commit (t, isSilent) {
    return new Promise(function(fulfill, reject){
      if(t){
        return t
          .commit()
          .then(function(){
            return fulfill();
          })
          .catch(function(err){
            return !!isSilent ? fulfill() : reject(err);
          })
      }else{
        return !!isSilent ? fulfill() : reject(new Error("Transaction is not defined"));
      }
    });
  }

  /**
   * Handle transaction rollback
   * @param t             - transaction
   * @param {Error} [err] - error that causes transaction rollback
   */
  static rollback (t, err) {
    return new Promise(function(fulfill, reject){
      if(t){
        return t
          .rollback()
          .then(function(){
            return reject();
          })
          .catch(function(tErr){
            return reject(err ? [err, tErr] : err);
          });
      }else{
        var tErr = new Error("Transaction is not defined");
        return reject(err ? [err, tErr] : err);
      }
    });
  }
}

module.exports = Sequelize;