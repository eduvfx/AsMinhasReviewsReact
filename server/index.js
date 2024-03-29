const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const express = require("express");
const session = require("express-session")
const fileUpload = require('express-fileupload');
fs = require('fs');

const saltRounds = 10;
const app = express();

app.use(fileUpload());
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    key: "userId",
    secret: "topsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 60 * 24
    }
}))

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "root",
    database: "reviews"
})

//Registar utilizador na base de dados
app.post("/register", (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    bcrypt.hash(password, saltRounds, (err, hash) => {
        db.query("SELECT * FROM Utilizadores WHERE Nome = ?;", username, (err, result) => {
            if (err) {
                console.log(err)
            }
            if (result.length > 0) {
                res.send({ message1: "Esse nome de utilizador não está disponível.", message2: "" })
            } else {
                db.query("SELECT * FROM Utilizadores WHERE Email = ?;", email, (err, result) => {
                    if (result.length > 0) {
                        res.send({ message2: "Esse email não está disponível.", message1: "" })
                    }
                    else {
                        db.query("INSERT INTO Utilizadores (Nome, Email, Password) VALUES (?,?,?)", [username, email, hash], (err, result) => {
                            if (err) {
                                console.log(err)
                            }
                            res.send({ message1: "", message2: "", registado: "true" })
                        })
                    }
                })
            }
        })
    })
})

//Devolver dados sobre o utilizador autenticado
app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({ auth: true, user: req.session.user })
    } else {
        res.send({ auth: false, user: "n" })
    }
})

//Retornar nome do utilizador autenticado
app.get("/getUsername", (req, res) => {
    idUser = req.query.idCriador
    db.query("SELECT Nome FROM Utilizadores WHERE Id = ?;", idUser, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.send(result)
        }
    })
})

//Efetuar logout do utilizador autenticado
app.post("/logout", (req, res) => {
    res.send({ auth: false })
    req.session.destroy();
})

//Editar nome do utilizador autenticado
app.post("/changeUsername", (req, res) => {
    const username = req.body.username
    const usernameNovo = req.body.usernameNovo
    db.query("UPDATE Utilizadores SET Nome = ? WHERE Nome = ?;", [usernameNovo, username], (err, result) => {
        if (err) {
            console.log(err)
            res.send({ erro: "Ocorreu um erro.", confirm: "" })
        } else {
            req.session.user[0].Nome = usernameNovo
            res.send({ erro: "", confirm: "Nome de utilizador alterado com sucesso." })
        }
    })
})

//Efetuar mudança do email do utilizador autenticado
app.post("/changeEmail", (req, res) => {
    const email = req.body.email
    const emailNovo = req.body.emailNovo
    db.query("UPDATE Utilizadores SET Email = ? WHERE Email = ?;", [emailNovo, email], (err, result) => {
        if (err) {
            console.log(err)
            res.send({ erro: "Ocorreu um erro.", confirm: "" })
        } else {
            res.send({ erro: "", confirm: "Email alterado com sucesso." })
        }
    })
})

//Efetuar mudança de palavra-passe do utilizador autenticado
app.post("/changePassword", (req, res) => {
    const password = req.body.password
    bcrypt.hash(password, saltRounds, (hash) => {
        db.query("UPDATE Utilizadores SET Password = ? WHERE Nome = ?;", [hash, req.session.user[0].Nome], (err, result) => {
            if (err) {
                console.log(err)
                res.send({ erro: "Ocorreu um erro.", confirm: "" })
            } else {
                res.send({ erro: "", confirm: "Palavra-passe alterada com sucesso." })
            }
        })
    })
})

//Autenticar o utilizador
app.post("/login", (req, res) => {
    const username = req.body.username
    const password = req.body.password
    db.query("SELECT * FROM Utilizadores INNER JOIN userroles ON Utilizadores.Id = userroles.UserId WHERE Nome = ?", username, (err, result) => {
        if (err) {
            console.log(err)
        }
        if (result.length > 0) {
            bcrypt.compare(password, result[0].Password, (err, response) => {
                if (response) {
                    req.session.user = result
                    res.send({ auth: true, result: result, message1: "", message2: "" })
                } else {
                    res.send({ auth: false, message1: "Password incorreta.", message2: "" })
                }
            })
        } else {
            res.send({ auth: false, message2: "O utilizador não existe.", message1: "" })
        }
    })
}
)

//Devolver informações de um jogo
app.get("/getJogo", (req, res) => {
    const idJogo = req.query.idJogo
    db.query("SELECT * FROM jogos WHERE Id = ?", idJogo, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

//Devolver informações de uma review
app.get("/getReview", (req, res) => {
    const idReview = req.query.idReview
    const userId = req.query.userId
    db.query("SELECT *,(Select valor FROM reviews.upvotes WHERE IdReview = reviews.Id AND IdUser = ?) AS uservote, (Select if (uservote=1,'UpVote2', 'UpVote')) AS upvoteName, (Select if (uservote=-1,'DownVote2', 'DownVote')) AS downvoteName, (Select COUNT(valor) FROM reviews.upvotes WHERE IdReview = reviews.Id AND valor = 1)-(select COUNT(valor) FROM reviews.upvotes WHERE IdReview = reviews.Id AND valor = -1) AS upvotes, (SELECT Nome FROM utilizadores WHERE Id = reviews.Criador) as CriadorNome, (SELECT Nome FROM jogos WHERE Id = reviews.Jogo) as JogoNome FROM reviews WHERE Id = ?", 
    [userId, idReview, idReview, idReview], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

//Devolver informações de uma review e do respetivo jogo 
app.get("/getReviewsJogo", (req, res) => {
    const idJogo = req.query.idJogo
    const userId = req.query.userId
    db.query("SELECT *,(Select valor FROM reviews.upvotes WHERE IdReview = reviews.Id AND IdUser = ?) AS uservote, (Select if (uservote=1,'UpVote2', 'UpVote')) AS upvoteName, (Select if (uservote=-1,'DownVote2', 'DownVote')) AS downvoteName, (Select COUNT(valor) FROM reviews.upvotes WHERE IdReview = reviews.Id AND valor = 1)-(select COUNT(valor) FROM reviews.upvotes WHERE IdReview = reviews.Id AND valor = -1) AS upvotes, (SELECT Nome FROM utilizadores WHERE Id = reviews.Criador) as CriadorNome FROM reviews WHERE Jogo = ?", [userId, idJogo], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

//Devolver informações de uma review e do respetivo utilizador
app.get("/getReviewsUser", (req, res) => {
    const idCriador = req.query.idCriador
    const userId = req.query.userId
    db.query("SELECT *,(Select valor FROM reviews.upvotes WHERE IdReview = reviews.Id AND IdUser = ?) AS uservote, (Select if (uservote=1,'UpVote2', 'UpVote')) AS upvoteName, (Select if (uservote=-1,'DownVote2', 'DownVote')) AS downvoteName, (Select COUNT(valor) FROM reviews.upvotes WHERE IdReview = reviews.Id AND valor = 1)-(select COUNT(valor) FROM reviews.upvotes WHERE IdReview = reviews.Id AND valor = -1) AS upvotes ,(SELECT Nome FROM jogos WHERE Id = reviews.Jogo) as JogoNome FROM reviews WHERE Criador = ?", [userId, idCriador], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

//Devolver lista dos jogos
app.get("/listajogos", (req, res) => {
    const ordem = req.query.ordem
    if (ordem == "Rating") {
        db.query("SELECT * FROM jogos ORDER BY Rating DESC", (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        });
    } else if (ordem === "Nome") {
        db.query("SELECT * FROM jogos ORDER BY Nome ASC", (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        });
    }
    else {
        db.query("SELECT * FROM jogos ORDER BY DataLancamento DESC", (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        });
    }
});

//Remoção de um jogo da base de dados
app.post("/removerJogo", (req, res) => {
    const idJogo = req.body.idJogo
    const capa = req.body.capa
    const nomeFormatado = req.body.nomeFormatado
    const fotosLength = req.body.fotosLength
    fs.unlink("./../client/asminhasreviews/public/Fotos/" + capa, function (err) {
        if (err) {
            throw err
        }
    })
    let i = 0
    while (i < fotosLength) {
        fs.unlink("./../client/asminhasreviews/public/Fotos/" + nomeFormatado + (i + 1) + ".png", function (err) {
            if (err) {
                throw err
            }
        })
        i++
    }
    db.query("DELETE FROM Jogos WHERE Id = ?", idJogo, (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ apagado: "true" })
    })
});

//Edição de um jogo na base de dados
app.post("/jogoEditar", (req, res) => {
    const idJogo = req.body.idJogo
    const oldCapa = req.body.oldCapa
    const oldNomeFormatado = req.body.oldNomeFormatado
    const oldFotosLength = req.body.oldFotosLength
    let j = 0
    while (j < oldFotosLength) {
        fs.unlink("./../client/asminhasreviews/public/Fotos/" + oldNomeFormatado + (j + 1) + ".png", function (err) {
            if (err) {
                throw err
            } else {
                console.log("File deleted")
            }
        })
        j++
    }
    fs.unlink("./../client/asminhasreviews/public/Fotos/" + oldCapa, function (err) {
        if (err) {
            throw err
        }
    })
    const nome = req.body.nome
    const nomeFormatado = req.body.nome.toLowerCase().replace(/\s/g, '')
    const capa = nomeFormatado + "." + req.body.capa
    const plataformas = req.body.plataformas
    const dataLancamento = req.body.dataLancamento
    const descricao = req.body.descricao
    const file = req.files.capaFicheiro
    const fotos = req.files.fotos
    const fotosLength = req.body.fotosLength
    if (fotosLength == 1) {
        fotos.mv("./../client/asminhasreviews/public/Fotos/" + nomeFormatado + 1 + ".png", err => {
            if (err) {
                console.error(err);
                return res.status(500).send(err);
            }
        });
    } else {
        let i = 0
        while (i < fotosLength) {
            fotos[i].mv("./../client/asminhasreviews/public/Fotos/" + nomeFormatado + (i + 1) + ".png", err => {
                if (err) {
                    console.error(err);
                    return res.status(500).send(err);
                }
            });
            i++
        }
    }
    file.mv("./../client/asminhasreviews/public/Fotos/" + capa, err => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
    });
    db.query("UPDATE jogos SET Nome = ?, NomeFormatado = ?, Capa = ?, Plataformas = ?, DataLancamento = ?, Descricao = ?, NumeroImgs = ? WHERE Id = ?", [nome, nomeFormatado, capa, plataformas, dataLancamento, descricao, fotosLength, idJogo], (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ editado: "true" })
    })
});

//Criação de um jogo na base de dados
app.post("/jogoCriar", (req, res) => {
    const nome = req.body.nome
    const nomeFormatado = req.body.nome.toLowerCase()
    const capa = nomeFormatado + "." + req.body.capa
    const plataformas = req.body.plataformas
    const dataLancamento = req.body.dataLancamento
    const descricao = req.body.descricao
    const file = req.files.capaFicheiro
    const fotos = req.files.fotos
    const fotosLength = req.body.fotosLength
    let i = 0
    while (i < fotosLength) {
        fotos[i].mv("./../client/asminhasreviews/public/Fotos/" + nomeFormatado + (i + 1) + ".png", err => {
            if (err) {
                console.error(err);
                return res.status(500).send(err);
            }
        });
        i++
    }
    file.mv("./../client/asminhasreviews/public/Fotos/" + capa, err => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
    });
    db.query("INSERT INTO Jogos (Nome, NomeFormatado, Capa, Plataformas, Rating, DataLancamento, Descricao, NumeroImgs) VALUES (?,?,?,?,0,?,?,?)", [nome, nomeFormatado, capa, plataformas, dataLancamento, descricao, fotosLength], (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ criado: "true" })
    })
});

//Edição de uma review na base de dados
app.post("/reviewEditar", (req, res) => {
    const conteudo = req.body.conteudo
    const rating = req.body.rating
    const idReview = req.body.idReview
    db.query("UPDATE reviews SET Conteudo = ?, Rating = ? WHERE Id = ?", [conteudo, rating, idReview], (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ editado: "true" })
    })
});

//Recalcular rating de um jogo
app.post("/atualizarRating", (req, res) => {
    const jogoId = req.body.jogoId
    db.query("UPDATE jogos SET Rating = (SELECT avg(rating) FROM reviews WHERE jogo = ?) WHERE Id = ?", [jogoId, jogoId], (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ criado: "true" })
    })
});

//Criação de uma review na base de dados
app.post("/reviewCriar", (req, res) => {
    const conteudo = req.body.conteudo
    const dataCriacao = req.body.dataCriacao
    const rating = req.body.rating
    const jogoId = req.body.jogoId
    const criador = req.body.criador
    db.query("INSERT INTO reviews (DataCriacao, Conteudo, Rating, Criador, Jogo) VALUES (?,?,?,?,?)", [dataCriacao, conteudo, rating, jogoId, criador], (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ criado: "true" })
    })
});

//Remoção de uma review na base de dados
app.post("/removerReview", (req, res) => {
    const idReview = req.body.idReview
    db.query("DELETE FROM reviews WHERE Id = ?", idReview, (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ apagado: "true" })
    })
});

//Remoção de um upvote ou downvote
app.post("/votoRemover", (req, res) => {
    const idReview = req.body.idReview
    const idUser = req.body.idUser
    db.query("DELETE FROM upvotes WHERE IdReview = ? AND IdUser = ?", [idReview, idUser], (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ apagado: "true" })
    })
});

//Criação de um upvote ou downvote
app.post("/votoCreate", (req, res) => {
    const idReview = req.body.idReview
    const idUser = req.body.idUser
    const valor = req.body.valor
    db.query("INSERT INTO upvotes (IdReview, Valor, IdUser) VALUES (?,?,?)", [idReview, valor, idUser], (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ criado: "true" })
    })
});

//Atualização de um upvote ou downvote
app.post("/votoUpdate", (req, res) => {
    const idReview = req.body.idReview
    const idUser = req.body.idUser
    const valor = req.body.valor
    db.query("UPDATE upvotes SET Valor = ? WHERE IdReview = ? AND IdUser = ?", [valor, idReview, idUser], (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send({ atualizado: "true" })
    })
});

app.listen(3001, () => {
    console.log("Servidor a correr")
})