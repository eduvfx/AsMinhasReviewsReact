import React, { useState } from "react"
import Navbar from "../../Components/Navbar/Navbar"
import Footer from "../../Components/Footer/Footer.js"
import Axios from "axios"
import { useNavigate } from "react-router-dom";

const CriarJogo = () => {

    const [nome, setNome] = useState("")
    const [capa, setCapa] = useState("")
    const [capaFicheiro, setCapaFicheiro] = useState(null)
    const [plataformas, setPlataformas] = useState("")
    const [dataLancamento, setDataLancamento] = useState(new Date())
    const [descricao, setDescricao] = useState("")
    const [fotos, setFotos] = useState([]);
    const navigate = useNavigate()

    const jogoCriar = () => {
        const formData = new FormData()
        formData.append('capaFicheiro', capaFicheiro)
        formData.append('nome', nome)
        formData.append('capa', capa)
        formData.append('plataformas', plataformas)
        formData.append('dataLancamento', dataLancamento)
        formData.append('descricao', descricao)
        Axios.post("http://localhost:3001/jogoCriar", formData,{
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((response) => {
            console.log(response);
            if (response.data.criado == "true") {
                navigate("/Jogos/Index/Rating");
            }
        })
    }

    const uploadFotos = event => {
        console.log(event.target.files[0])
        setCapaFicheiro(event.target.files[0])
    }

    const uploadImagem = event => {
        console.log(event.target.files[0])
        setCapa(event.target.files[0].type.replace("image/", "").replace("jpeg", "jpg"))
        setCapaFicheiro(event.target.files[0])
    }

    return (
        <div>
            <Navbar />
            <div style={{ marginTop: "10px", float: "left", marginLeft: "16%", textAlign: "left", width: "1300px" }}>
                <h1>Criar jogo</h1>
                <hr />
                <p className="RegText">Nome</p>
                <input className="input" type="text" style={{ height: "40px" }} onChange={(e) => { setNome(e.target.value) }}></input>
                <br />
                <p className="RegText">Capa</p>
                <input type="file" style={{ height: "40px" }} onChange={(e) => { uploadImagem(e) }}></input>
                <br />
                <p className="RegText">Plataformas</p>
                <input className="input" type="text" style={{ height: "40px" }} onChange={(e) => { setPlataformas(e.target.value) }}></input>
                <br />
                <p className="RegText">Data de Lancamento</p>
                <input className="input" type="date" style={{ height: "40px" }} onChange={(e) => { setDataLancamento(e.target.value) }}></input>
                <p className="RegText">Descrição</p>
                <textarea className="input" type="text" style={{ height: "150px" }} onChange={(e) => { setDescricao(e.target.value) }}></textarea>
                <br />
                <p className="RegText">Fotos</p>
                <input type="file" multiple style={{ height: "40px" }} onChange={(e) => { uploadFotos(e) }}></input>
                <br />
                <br />
                <button style={{ width: "5%", height: "40px", fontSize: "18px" }} onClick={jogoCriar} className="mainButton">Criar</button>
            </div>
            <Footer />
        </div>
    )
}

export default CriarJogo