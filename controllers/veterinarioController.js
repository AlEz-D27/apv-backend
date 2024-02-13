import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
    // Se extrae el email ya que debe ser único
    const { email, nombre } = req.body;

    // Prevenir Usuarios Duplicados
    // En el findOne se le pasa en forma de objeto pero como la llave es "email" 
    // y el valor tambien es email entonces se le pasa solo uno.
    const existeUsuario = await Veterinario.findOne({email});

    if ( existeUsuario ) {
        const error = new Error("Usuario no válido, el usuario ya existe");
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Guardar un nuevo Veterinario
        const veterinario = new Veterinario(req.body);

        const veterinarioGuardado = await veterinario.save();

        // Enviar el Email
        emailRegistro({ 
            email, 
            nombre, 
            token: veterinarioGuardado.token 
        });

        res.json({ veterinarioGuardado });
    } catch (error) {
        console.log(error);
    }
};

const perfil = (req, res) => {

    const { veterinario } = req;

    res.json(veterinario);
};

const confirmar = async (req, res) => {
    const { token } = req.params;

    const usuarioConfirmar = await Veterinario.findOne({token});

    console.log(usuarioConfirmar)

    if ( !usuarioConfirmar ) {
        const error = new Error("Token no válido");
        return res.status(404).json({ msg: error.message });
    };

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        
        await usuarioConfirmar.save();

        console.log(usuarioConfirmar);

        return res.json({ msg: "Usuario Confirmado Correctamente"});
    } catch (error) {
        console.log(error);
    }
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;

    const usuario = await Veterinario.findOne({email});

    // Comprobar si el usuario existe
    if ( !usuario ) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    };

    // Comprobar si el usuario está confirmado
    if ( !usuario.confirmado ) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(404).json({ msg: error.message });
    };

    // Revisar password del Usuario
    if ( await usuario.comprobarPassword(password) ) {
        // Autenticar al usuario
        res.json({ 
            _id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id) 
        });

        console.log('pasa la generacion de jwt');
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(404).json({ msg: error.message });
    }
}

const olvidePassword = async (req, res) => {
    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({email});

    if ( !existeVeterinario ) {
        const error = new Error("El usuario no existe");
        return res.status(400).json({ msg: error.message });
    }

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        // Enviar Email con Instrucciones
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })

        res.json({ msg: 'Hemos enviado un email con las instrucciones' });
    } catch (error) {
        console.log(error);
    }
};

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const tokenValido = await Veterinario.findOne({token});

    if ( tokenValido ) {
        // El token es válido y el usuario existe
        res.json({ msg: "El token es válido y el usuario existe"});
    } else {
        const error = new Error("El token no es válido");
        return res.status(400).json({ msg: error.message });
    }
};

const nuevoPassword = async (req, res) => {
    const { token } = req.params;

    const { password } = req.body;

    const veterinario = await Veterinario.findOne({token});

    if ( !veterinario ) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }    

    try {
        veterinario.token = null;
        veterinario.password = password;

        await veterinario.save();

        return res.json({ msg: "Password Modificado Correctamente"});
    } catch (error) {
        console.log(error);
    }
};

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);

    if ( !veterinario ) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }

    const { email } = req.body;

    if ( veterinario.email !== req.body.email ) {
        const existeEmail = await Veterinario.findOne({email});
        if ( existeEmail ) {
            const error = new Error("Ese Email ya esta en uso");
            return res.status(400).json({ msg: error.message });
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;
        veterinario.email = req.body.email;

        const veterinarioActualizado = await veterinario.save();

        res.json(veterinarioActualizado);
    } catch (error) {
        console.log(error);
    }

}

const actualizarPassword = async (req, res) => {
    console.log(req.body);
    // Leer los datos
    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;

    // Comprobar que el veterinario existe
    const veterinario = await Veterinario.findById(id);

    if ( !veterinario ) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }

    // Comprobar su password
    if ( await veterinario.comprobarPassword(pwd_actual) ) {
        // Almacenar el nuevo password
        console.log('Pass Correcto');
        veterinario.password = pwd_nuevo;

        await veterinario.save();

        return res.json({ msg: 'Actualizado Correctamente' })
    } else {
        console.log('Pass Incorrecto');
        const error = new Error("El Password Actual es Incorrecto");
        return res.status(400).json({ msg: error.message });
    }
}

export {
    registrar,
    perfil, 
    confirmar,
    autenticar,
    olvidePassword, 
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}