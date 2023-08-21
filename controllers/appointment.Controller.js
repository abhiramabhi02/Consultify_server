
const getAllAppointments = async(appointments)=>{

    const data = await appointments.aggregate([
        {
          $addFields: {
            UserId: { $toObjectId: "$UserId" },
            ProId: { $toObjectId: "$ProId" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "UserId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "professionals",
            localField: "ProId",
            foreignField: "_id",
            as: "professional"
          }
        },
        {
          $unwind: "$user" // This step is necessary to deconstruct the 'user' array from the lookup
        },
        {
          $unwind: "$professional" // This step is necessary to deconstruct the 'professional' array from the lookup
        },
        {
          $project: {
            _id: 1,
            UserId: 1,
            ProId: 1,
            BookingDate: 1,
            Date: 1,
            Time: 1,
            Payment: 1,
            Status: 1,
            userName: "$user.Name", // Include the name of the user from the 'user' object
            professionalName: "$professional.Name" // Include the name of the professional from the 'professional' object
          }
        }
      ]);
      return data
}

const userProfessionalAppointment = async(appointment,role, id)=>{
    const data = await appointment.aggregate([
        {
          $addFields: {
            UserId: { $toObjectId: "$UserId" },
            ProId: { $toObjectId: "$ProId" },
          },
        },
        {
          $match: {
            [role]: id, 
          },
        },
        {
            $lookup: {
              from: "users",
              localField: "UserId",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $lookup: {
              from: "professionals",
              localField: "ProId",
              foreignField: "_id",
              as: "professional"
            }
          },
          {
            $unwind: "$user" // This step is necessary to deconstruct the 'user' array from the lookup
          },
          {
            $unwind: "$professional" // This step is necessary to deconstruct the 'professional' array from the lookup
          },
          {
            $project: {
              _id: 1,
              UserId: 1,
              ProId: 1,
              BookingDate: 1,
              Date: 1,
              Time: 1,
              Payment: 1,
              Status: 1,
              userName: "$user.Name", // Include the name of the user from the 'user' object
              professionalName: "$professional.Name" // Include the name of the professional from the 'professional' object
            }
          }
        ]);
        return data
}

module.exports = {
    getAllAppointments,
    userProfessionalAppointment
}