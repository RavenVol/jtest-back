exports.getSocketID = (req, res, next) => {
  console.log('getSocketID');
  req.socketID = req.headers.cookie.split(';').filter(part => part.includes('io='))[0].trim().replace('io=', '');
  next();
}

exports.sendInfoToSocket = (req, res) => {
  console.log('sendInfoToSocket');
  const io = req.app.get('io');
  io.in(req.socketID).emit('user', req.user);
}