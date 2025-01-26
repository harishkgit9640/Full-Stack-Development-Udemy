# MONGODB AGGRIGATION PIPLINE

#sum of any collection

    [
      {
        $match: {
        	isActive : true
        }
      },
      {
        $count: 'activeUser'
      }
    ]

==================== average of any collection ====================

    [
      {
        $group: {
        _id: null,
          avgAge :{
          $avg : "$age"
          }
        }
      }
    ]

==================== top most record of any collection ====================
[
{
$group: {
_id: "$favoriteFruit",
count :{
$sum : 1
}
}
},
{
$sort: {
count: -1
}
},
{
$limit: 2
}
]

==================== which country has highest logged in user in collection ====================

[
{
$group: {
_id: "$company.location.country",
count :{
$sum : 1
}
}
},
{
$sort: {
count: -1
}
},
{
$limit: 1
}
]

==================== login count male/female in collection ====================

[
{
$group : {
_id : "$gender",
genderCount : {
$sum :1
}
}
}
]

==================== find unique eye-colour in collection ====================

[
{
$group : {
_id : "$eyeColor",
}
}
]

==================== find the avg num of tag/user in array collection ====================
#1 method =>

[
{
$unwind: {
path: "$tags",
}
},
{
$group: {
_id: "$_id",
numTags :{
$sum: 1
}
},
},
{
$group: {
_id: null,
avgTags : {
$avg : "$numTags"
}
}
}
]

#2 method =>
[
{
$addFields: {
      numOfTags: {
        $size : {$ifNull : ["$tags", []]}
      }
    }
    },
    {
      $group: {
        _id: null,
        avgTags : {
          $avg : "$numOfTags"
}
}
}
]

==================== find the user with enim in collection ====================
[
{
$match: {
tags : "enim"
}
},
{
$count: 'userWithenim'
}
]

==================== find the user with velit and who are inactive in collection ====================

[
{
$match: {
tags : "velit",
isActive : false
}
},
{
$project: {
name : 1,
age: 1
}
}
]

==================== find the user who has +1 mobile no. in collection ====================

[
{
$match: {
"company.phone" : /^\+1 \(940\)/
}
},
{
$count: 'userWith1num'
}
]

==================== find the user who register most recently in collection ====================

[
{
$sort: {
registered: -1
}
},
{
$project: {
name:1,
age:1,
registered:1,
favoriteFruit:1
}
}
]

==================== categorize users by favorite fruit collection ====================

[
{
$group: {
_id: "$favoriteFruit",
users : {
$push : "$name"
}
}
}
]

==================== how manay users have 'ad' tag as second position in their tag ====================

    [
    {
    $match: {
    "tags.1" : "ad",
    }
    },{
    $count: 'usercountwithtagad'
    }
    ]

==================== find the users have 'enim' and 'id' tag in their tag ====================

[
{
$match: {
      tags : {$all : ["enim", "id"]}
}
},
{
$project: {
name:1,
age:1,
gender:1
}
}
]

==================== find the company who is in USA ====================

[
{
$match: {
      "company.location.country": "USA"
    }
  },
  {
    $group: {
      _id: "$company.title",
userCount: {
$sum: 1
}
}
},

]

==================== lookup with [books, users] ==================== (lookup)
[
{
$lookup: {
      from: "authors",
      localField: "author_id",
      foreignField: "_id",
      as: "author_details"
    }
  },
  {
    $addFields: {
      author_details: {
        $first : "$author_details"
// $arrayElemAt: ["$author_details",0]
}
}
}
]
