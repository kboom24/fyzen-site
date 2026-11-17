/* Connect your ad network here. The game calls rewarded() when a player accepts a second chance.
   Resolve true if the ad finished and the reward should be given, false if not.
   With this file unchanged the game runs without ads and gives the second chance for free.

   window.SHORTFUSE_ADS={name:'my-network',rewarded(){return new Promise(done=>{
     // start your network's rewarded ad, then call done(true) when finished or done(false) if skipped
   });}};
*/
