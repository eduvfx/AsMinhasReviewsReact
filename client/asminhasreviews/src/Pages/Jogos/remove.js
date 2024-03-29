import React, { useEffect, useState } from "react"
import Navbar from './../../Components/Navbar/Navbar.js'
import Footer from "./../../Components/Footer/Footer.js"
import Axios from "axios"
import dateFormat from "dateformat"
import { Navigate, useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";

const Index = () => {

    const [listaJogos, setListaJogos] = useState([]);
    const [imagePath] = useState("/Fotos/");
    const { idJogo } = useParams()
    const [listaFotos, setListaFotos] = useState([]);
    const navigate = useNavigate()

    const jogoRemover = () => {
        //Remover o jogo
        Axios.post("http://localhost:3001/removerJogo", {
            idJogo: idJogo, nomeFormatado: listaJogos[0].NomeFormatado, fotosLength: listaJogos[0].NumeroImgs, capa: listaJogos[0].Capa
        }).then((response) => {
            console.log(response);
            //Se a remoção for válida, mudar para a página com os jogos mais recentes
            if (response.data.apagado == "true") {
                navigate("/Jogos/Index/DataLancamento");
            }
        });
    }

    useEffect(() => {
        //Buscar as informações do jogo
        Axios.get("http://localhost:3001/getJogo", {
            params: { idJogo }
        }).then((response) => {
            console.log(response);
            setListaJogos(response.data);
            for (let i = 0; i < response.data[0].NumeroImgs; i++) {
                setListaFotos(listaFotos => [...listaFotos, response.data[0].NomeFormatado + (i + 1) + ".png"])
            }
        });
        //Verificar "role" do utilizador
        Axios.get("http://localhost:3001/login").then((response) => {
            if (response.data.user[0].RoleId != "a") {
                Navigate("/Jogos/Index/DataLancamento")
            //Se o utilizador não for administrador, mudar para a página com os jogos mais recentes
            } else {
                navigate("/")
            }
        })
    }, [])

        return (
            <div style={{ textAlign: "center" }}>
                <Navbar />
                <div style={{ marginLeft: "auto", marginRight: "auto", maxWidth: "1300px", marginBottom: "100px" }}>
                    <h1 style={{ marginTop: "20px", textAlign: "left" }}>Remover jogo</h1>
                    <hr style={{ marginBottom: "15px" }}></hr>
                    <table>
                        <tbody style={{ textAlign: "left", verticalAlign: "top" }}>
                            {listaJogos.map((val, key) => {
                                return (
                                    <><tr>
                                        <td>
                                            <b>Nome</b>
                                        </td>
                                        <td style={{ marginBottom: "10px", display: "block" }}>
                                            {val.Nome}
                                        </td>
                                    </tr><tr>
                                            <td>
                                                <b>Capa</b>
                                            </td>
                                            <td style={{ marginBottom: "10px", display: "block" }}>
                                                <img height="175px" src={imagePath + val.Capa}></img>
                                            </td>
                                        </tr><tr>
                                            <td>
                                                <b>Plataformas</b>
                                            </td>
                                            <td style={{ marginBottom: "10px", display: "block" }}>
                                                {val.Plataformas}
                                            </td>
                                        </tr><tr>
                                            <td>
                                                <b>Rating</b>
                                            </td>
                                            <td style={{ marginBottom: "10px", display: "block" }}>
                                                {val.Rating}
                                            </td>
                                        </tr><tr>
                                            <td>
                                                <b>Data de Lancamento</b>
                                            </td>
                                            <td style={{ marginBottom: "10px", display: "block" }}>
                                                {dateFormat(val.DataLancamento, "dd")}/{dateFormat(val.DataLancamento, "mm")}/{dateFormat(val.DataLancamento, "yyyy")}
                                            </td>
                                        </tr><tr>
                                            <td>
                                                <b>Descrição</b>
                                            </td>
                                            <td style={{ marginBottom: "10px", display: "block" }}>
                                                {val.Descricao}
                                            </td>
                                        </tr></>
                                )
                            })}
                            <tr>
                                <td style={{ textAlign: "left", marginRight: "130px", display: "block" }}><b>Fotografias</b></td>
                                <td>
                                    {listaFotos.map((val, key) => {
                                        return (
                                            <img style={{ float: "left", marginRight: "10px", marginBottom: "10px" }} height="150px" src={imagePath + val}></img>
                                        )
                                    })}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <button className="btnRemover" onClick={jogoRemover}>Remover</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Footer />
            </div>
        )
    }

export default Index