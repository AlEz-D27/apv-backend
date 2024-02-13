import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";

const checkAuth = async (req, res, next) => {

    let token;
    
    // Se compreba si existe la autenticación del token y si comienza con Bearer
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {
        try {
            /* Lo que hace esta linea es consultar el token y con el método .split() eliminar el espacio
            entre la palabra Bearer y los datos del token convirtiéndolo en un array, la palabra Bearer en 
            la posición 0 y los datos del token en la posición 1, por eso la variable toma la posición 1 */
            token = req.headers.authorization.split(" ")[1];

            /* Esta linea compara utilizando el método verify de jwt la varible token que se consultó
            anteriormente con el token creado y almacenado en la variable JWT_SECRET de las variables de 
            entorno en .env */
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Se elimina de la consulta el password, token y confirmado ya que son datos sensibles
            req.veterinario = await Veterinario.findById(decoded.id).select('-password -token -confirmado');

            return next();
        } catch (error) {
            const e = new Error("Token no válido");
            res.status(404).json({ msg: e.message });
            console.log(error);
        }
    }

    if ( !token ) {
        const error = new Error("Token no válido o inexistente");
        res.status(404).json({ msg: error.message });

    }

    next();
};

export default checkAuth;