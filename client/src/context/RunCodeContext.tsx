import axios from "axios"
import { RunContext as RunContextType } from "@/types/run"
import {
    ReactNode,
    createContext,
    useContext,
    useState,
    useEffect,
} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"

const RunCodeContext = createContext<RunContextType | null>(null)

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error(
            "useRunCode must be used within a RunCodeContextProvider",
        )
    }
    return context
}



const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
    const { activeFile } = useFileSystem()

    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)

    const [supportedLanguages, setSupportedLanguages] = useState<any[]>([])
    const [selectedLanguage, setSelectedLanguage] = useState<any>({
        language: "",
        version: "",
        aliases: [],
    })

    /* load supported languages */
    useEffect(() => {
        setSupportedLanguages(jdoodleLanguages)
        setSelectedLanguage(jdoodleLanguages[0])
    }, [])

    /* auto select language based on file extension */
    useEffect(() => {
        if (!activeFile) return

        const extension = activeFile.name.split(".").pop()

        const lang = jdoodleLanguages.find((l) =>
            l.aliases.includes(extension || ""),
        )

        if (lang) setSelectedLanguage(lang)
    }, [activeFile])

    const runCode = async () => {
        try {
            if (!activeFile) {
                return toast.error("Please open a file to run the code")
            }

            if (!selectedLanguage.language) {
                return toast.error("Please select a language")
            }

            toast.loading("Running code...")
            setIsRunning(true)

            const response = await axios.post("http://localhost:3000/run", {
                script: activeFile.content,
                stdin: input,
                language: selectedLanguage.language,
                versionIndex: selectedLanguage.version,
            })

            setOutput(response.data.output)

            toast.dismiss()
            setIsRunning(false)
        } catch (error: any) {
            console.error(error?.response?.data)
            toast.dismiss()
            toast.error("Failed to run the code")
            setIsRunning(false)
        }
    }

    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode,
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext