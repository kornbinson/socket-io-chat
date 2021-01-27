const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios');

const { crearMensaje } = require('../utils/utils');

const usuarios = new Usuarios;


io.on('connection', (client) => {

    
   client.on('entrarChat', (data, callback) => {

        // console.log(data);

        if (!data.nombre || !data.sala ) {

            return callback({
                error: true,
                mensaje: 'El nombre y sala son  necesario'
            });
            
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona( client.id, data.nombre, data.sala );

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala) );

        callback( usuarios.getPersonasPorSala(data.sala) );

   });

   client.on('crearMensaje',(data)=>{

       let user = usuarios.getPersona(client.id);

       let mensaje = crearMensaje( user.nombre, data.mensaje );

    //    console.log(mensaje);

       client.broadcast.to(user.sala).emit('crearMensaje',mensaje);

   });



   client.on('disconnect',()=>{
       let personOff = usuarios.borrarPersona(client.id);
       client.broadcast.to(personOff.sala).emit('crearMensaje', crearMensaje('Admin',`${personOff.nombre} salio`)  );
       client.broadcast.to(personOff.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personOff.sala));
   });


   client.on('mensajePrivado',data => {


        let person = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado',crearMensaje(person.nombre,data.mensaje) );

    
   });


   
});