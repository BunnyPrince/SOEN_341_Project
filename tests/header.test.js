const proceed = require('../public/scripts/header.js');

describe('header Test', () => {
  it('should return a boolean', () =>{
    const value = proceed()
    expect(value).toEqual(true)
  })
})
