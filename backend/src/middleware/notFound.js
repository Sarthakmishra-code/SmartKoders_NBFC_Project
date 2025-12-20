// export default function notFound(req, res, next) {
//   res.status(404).json({
//     success: false,
//     message: `Not Found - ${req.originalUrl}`,
//   });
// }
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
};
