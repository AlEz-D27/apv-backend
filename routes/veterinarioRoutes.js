import express from "express";
import { 
    registrar, 
    perfil, 
    confirmar, 
    autenticar, 
    olvidePassword, 
    comprobarToken, 
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword 
} from "../controllers/veterinarioController.js"
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// ****** Área pública ******
// En este caso se utiliza post ya que se envian datos al servidor
router.post('/', registrar);

// En este caso se utiliza get ya que se Obtiene datos del servidor
router.get('/confirmar/:token', confirmar);

router.post('/login', autenticar);

router.post('/olvide-password', olvidePassword);

router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);


// ****** Área privada ******
router.get('/perfil', checkAuth, perfil);

router.put('/perfil/:id', checkAuth, actualizarPerfil);

router.put('/actualizar-password', checkAuth, actualizarPassword);

export default router;