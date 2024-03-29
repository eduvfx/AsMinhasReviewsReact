import React, { useEffect, useState } from "react"
import Navbar from './../../Components/Navbar/Navbar.js'
import Footer from "./../../Components/Footer/Footer.js"
import Axios from "axios"
import dateFormat from "dateformat"
import { useParams, useNavigate } from "react-router-dom"

const Index = () => {

    const [listaJogos, setListaJogos] = useState([]);
    const [imagePath] = useState("/Fotos/");
    const { idJogo } = useParams();
    const [textoEditar, setTextoEditar] = useState("")
    const [barra, setBarra] = useState("")
    const [textoRemover, setTextoRemover] = useState("")
    const [listaFotos, setListaFotos] = useState([]);
    const [listaReviews, setListaReviews] = useState([]);
    const [idUser, setIdUser] = useState()
    const navigate = useNavigate()
    let userId

    //Comportamento ao clicar no botão de "upvote"
    const upvote = ((uservote, idReview, loginId) => () => {
        if (loginId) {
            //Se o utilizador já tiver dado "upvote"...
            if (uservote == 1) {
                //Remover o "upvote" da review
                Axios.post("http://localhost:3001/votoRemover", {
                    idReview: idReview, idUser: loginId
                }).then((response) => {
                    console.log(response);
                    if (response.data.apagado == "true") {
                        window.location.reload(false);
                    }
                })
            //Se o utilizador tiver dado "downvote"...
            } else if (uservote == -1) {
                //Mudar o valor do "upvote" da review
                Axios.post("http://localhost:3001/votoUpdate", {
                    idReview: idReview, idUser: loginId, valor: 1
                }).then((response) => {
                    console.log(response);
                    if (response.data.atualizado == "true") {
                        window.location.reload(false);
                    }
                })
            //Se o utilizador não tiver nenhum voto...
            } else {
                //Adicionar "upvote" da review
                Axios.post("http://localhost:3001/votoCreate", {
                    idReview: idReview, idUser: loginId, valor: 1
                }).then((response) => {
                    console.log(response);
                    if (response.data.criado == "true") {
                        window.location.reload(false);
                    }
                })
            }
            //Se o utilizador não estiver autenticado...
        } else {
            //Mudar para a página de login
            navigate("/Account/Login")
        }
    })

    //Comportamento ao clicar no botão de "downvote"
    const downvote = ((uservote, idReview, loginId) => () => {
        if (loginId) {
            //Se o utilizador tiver dado "upvote"...
            if (uservote == 1) {
                //Mudar o valor do "downvote" da review
                Axios.post("http://localhost:3001/votoUpdate", {
                    idReview: idReview, idUser: loginId, valor: -1
                }).then((response) => {
                    console.log(response);
                    if (response.data.atualizado == "true") {
                        window.location.reload(false);
                    }
                })
            //Se o utilizador já tiver dado "downvote"...
            } else if (uservote == -1) {
                //Remover o "downvote" da review
                Axios.post("http://localhost:3001/votoRemover", {
                    idReview: idReview, idUser: loginId
                }).then((response) => {
                    console.log(response);
                    if (response.data.apagado == "true") {
                        window.location.reload(false);
                    }
                })
            //Se o utilizador não tiver nenhum voto
            } else {
                //Adicionar "downvote" da review
                Axios.post("http://localhost:3001/votoCreate", {
                    idReview: idReview, idUser: loginId, valor: -1
                }).then((response) => {
                    console.log(response);
                    if (response.data.criado == "true") {
                        window.location.reload(false);
                    }
                })
            }
            //Se o utilizador não estiver autenticado...
        } else {
            //Mudar para a página de login
            navigate("/Account/Login")
        }
    })

    useEffect(() => {
        //Se o utilizador for administrador, mostrar hiperligações para editar e remover o jogo
        Axios.get("http://localhost:3001/login").then((response) => {
            if (response.data.user[0].RoleId == "a") {
                setTextoEditar("Editar")
                setTextoRemover("Remover")
                setBarra(" | ")
            }
            setIdUser(response.data.user[0].Id)
            userId = response.data.user[0].Id
            //Buscar as reviews associadas ao jogo
            Axios.get("http://localhost:3001/getReviewsJogo", {
                params: { idJogo, userId }
            }).then((response) => {
                setListaReviews(response.data);
            });
        })
        //Buscar as informações do jogo
        Axios.get("http://localhost:3001/getJogo", {
            params: { idJogo }
        }).then((response) => {
            setListaJogos(response.data);
            for (let i = 0; i < response.data[0].NumeroImgs; i++) {
                setListaFotos(listaFotos => [...listaFotos, response.data[0].NomeFormatado + (i + 1) + ".png"])
            }
        });

    }, [])

    return (
        <div style={{ textAlign: "center" }}>
            <Navbar />
            <div style={{ marginLeft: "auto", marginRight: "auto", maxWidth: "1300px", marginBottom: "100px" }}>
                <table>
                    <tbody>
                        {listaJogos.map((val, key) => {
                            return (
                                <tr style={{ height: "225px", borderBottom: "1px solid #dee2e6", verticalAlign: "middle" }}>
                                    <td style={{ paddingRight: "10px" }}>
                                        <img height="175px" src={imagePath + val.Capa}></img>
                                    </td>
                                    <td style={{ padding: "5px" }}>
                                        <div style={{ float: "right" }}><h2>{val.Rating.toFixed(1)}<img style={{ marginLeft: "5px", marginBottom: "8px" }} height="25px" src="/favicon.ico "></img></h2></div>
                                        <div style={{ float: "left", width: "90%", textAlign: "left" }}><h3 className="titulo">{val.Nome}</h3></div>
                                        <div style={{ float: "left", width: "90%", textAlign: "left", fontSize: "13.5px" }}>Plataformas: {val.Plataformas}</div>
                                        <div style={{ float: "left", width: "90%", textAlign: "left", fontSize: "13.5px" }}>
                                            {dateFormat(val.DataLancamento, "dd")}/{dateFormat(val.DataLancamento, "mm")}/{dateFormat(val.DataLancamento, "yyyy")}
                                        </div>
                                        <div style={{ float: "left", width: "100%", textAlign: "left", fontSize: "17.5px" }}>{val.Descricao}</div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div style={{ marginTop: "16px", textAlign: "left" }}>
                    <h3>Fotografias</h3>
                    {listaFotos.map((val, key) => {
                        return (
                            <img style={{ width: "23%", height: "168.333333px", float: "left", marginRight: "10px", marginBottom: "10px" }} src={imagePath + val}></img>
                        )
                    })}

                </div>
                <div style={{ whiteSpace: "nowrap", marginTop: "200px", textAlign: "left" }}><hr></hr><h3>Reviews</h3></div>
                <table>
                    <tbody>
                        {listaReviews.map((val, key) => {
                            return (
                                <tr style={{ borderBottom: "1px solid #dee2e6", verticalAlign: "middle" }}>
                                    <td style={{ display: "block", textAlign: "center", marginRight: "10px", marginTop: "15px", marginBottom: "15px" }}>
                                        <div onClick={upvote(val.uservote, val.Id, idUser)} className={val.upvoteName}></div>
                                        <h2 style={{ marginBottom: "5px" }}>{val.upvotes}</h2>
                                        <div onClick={downvote(val.uservote, val.Id, idUser)} className={val.downvoteName}></div>
                                    </td>
                                    <td style={{ padding: "5px" }}>
                                        <div style={{ float: "left", width: "90%", textAlign: "left", fontSize: "13.5px" }}><a className="userLink" href={"../../Utilizadores/" + val.Criador}>{val.CriadorNome}</a></div>
                                        <div style={{ float: "right" }}><h2>{val.Rating.toFixed(0)}<img style={{ marginLeft: "5px", marginBottom: "8px" }} height="25px" src="/favicon.ico "></img></h2></div>
                                        <div style={{ float: "left", width: "90%", textAlign: "left" }}><a style={{ textDecoration: "none" }} href={"../../Reviews/Details/" + val.Id}><h3 className="conteudoReview">{val.Conteudo}</h3></a></div>
                                        <div style={{ float: "left", width: "90%", textAlign: "left", fontSize: "13.5px" }}>
                                            {dateFormat(val.DataCriacao, "dd")}/{dateFormat(val.DataCriacao, "mm")}/{dateFormat(val.DataCriacao, "yyyy")}
                                        </div>
                                        <div style={{ float: "left", width: "100%", textAlign: "left", fontSize: "17.5px" }}>{val.Descricao}</div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div style={{ whiteSpace: "nowrap", marginTop: "16px", textAlign: "left" }}><a href={"/Jogos/Edit/" + idJogo}>{textoEditar}</a> {barra} <a href={"/Jogos/Remove/" + idJogo}>{textoRemover}</a></div>
            </div>
            <Footer />
        </div>
    );
}

export default Index