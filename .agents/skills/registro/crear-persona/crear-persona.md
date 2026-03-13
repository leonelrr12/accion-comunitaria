async function crearPersona(data) {
return await prisma.persons.create({
data: {
first_name: data.nombre,
last_name: data.apellido,
phone: data.telefono,
community_id: data.community_id,
leader_user_id: data.lider_id
}
});
}
