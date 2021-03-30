const proceed = require('../public/scripts/profile.js');

describe('Profile Test', () => {
  it('should return a boolean', () =>{
      const value = editFollow(userid, type, username)
      const value2 = showList(userid, isBeingFollowed, duplicateUser, type, username)
      expect(value).toEqual(true)
      expect(value2).toEqual(true)
  })
})
